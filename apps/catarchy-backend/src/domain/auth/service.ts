import { createHash } from "node:crypto";

import ms from "ms";
import { uuidv7 } from "uuidv7";

import { UserRepository } from "@/domain/user";
import { getDatabase } from "@/infra/db";
import { runAtomic } from "@/lib/atomic";
import {
  ConflictError,
  ExternalServiceError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/error";

import { AuthRepository } from "./repository";
import { SessionRepository } from "./session.repository";

export abstract class AuthService {
  // Configurations
  static readonly accessTokenExp = "15m";
  static readonly refreshTokenExp = "7d";
  static readonly absoluteSessionExp = "90d";

  // database (transaction)
  private static get db() {
    return getDatabase();
  }

  // Repositories
  private static authRepository = AuthRepository;
  private static userRepository = UserRepository;
  private static sessionRepository = SessionRepository;

  static async signInWithRemiliaAccessToken(accessToken: string) {
    let response: Response;

    try {
      response = await fetch("https://www.remilia.net/api/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ExternalServiceError("Failed to reach RemiliaNET");
    }

    if (response.status === 401 || response.status === 403) {
      throw new UnauthorizedError("Invalid or expired RemiliaNET token");
    }

    if (!response.ok) {
      throw new ExternalServiceError("RemiliaNET profile request failed");
    }

    const profile = (await response.json().catch(() => null)) as {
      user?: { displayName?: unknown; username?: unknown };
    } | null;
    const username = profile?.user?.username;

    if (typeof username !== "string" || username.length === 0) {
      throw new ExternalServiceError(
        "RemiliaNET returned an invalid profile response",
      );
    }

    const remiliaUsername = username.trim().toLowerCase();
    if (remiliaUsername.length === 0) {
      throw new ExternalServiceError(
        "RemiliaNET returned an invalid profile response",
      );
    }
    const displayName =
      typeof profile?.user?.displayName === "string" &&
      profile.user.displayName.trim().length > 0
        ? profile.user.displayName.trim()
        : username.trim();
    const existingAuth = await this.authRepository.findAuthByRemiliaUsername({
      remiliaUsername,
    });

    if (existingAuth) {
      const [, user] = await Promise.all([
        this.authRepository.updateRemiliaDisplayName({
          remiliaDisplayName: displayName,
          remiliaUsername,
        }),
        this.userRepository.findById({ id: existingAuth.userId }),
      ]);

      if (!user) throw new NotFoundError("User not found");
      return user;
    }

    const userId = uuidv7();
    const handle = await this.createAvailableHandle(remiliaUsername);

    await runAtomic(this.db, [
      this.userRepository.create({ id: userId, handle }),
      this.authRepository.createRemiliaAuth({
        remiliaDisplayName: displayName,
        remiliaUsername,
        userId,
      }),
    ]);

    return { id: userId, handle };
  }

  private static async createAvailableHandle(username: string) {
    const sanitized = username
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/^_+|_+$/g, "");
    const base = (sanitized.length >= 4 ? sanitized : `${sanitized}_cat`)
      .slice(0, 15)
      .padEnd(4, "_");

    if (!(await this.userRepository.findByHandle({ handle: base }))) {
      return base;
    }

    const digest = createHash("sha256").update(username).digest("hex");

    for (let offset = 0; offset <= digest.length - 6; offset += 6) {
      const candidate = `${base.slice(0, 8)}_${digest.slice(offset, offset + 6)}`;
      if (!(await this.userRepository.findByHandle({ handle: candidate }))) {
        return candidate;
      }
    }

    throw new ConflictError("Unable to create an available handle");
  }

  static async createSession(userId: string, refreshToken: string) {
    const now = Date.now();
    const expiredAt = now + ms(this.refreshTokenExp);
    const absoluteExpiredAt = now + ms(this.absoluteSessionExp);
    return this.sessionRepository.createSession({
      userId,
      refreshToken,
      expiredAt,
      absoluteExpiredAt,
    });
  }

  static async rotateSession(
    oldRefreshToken: string,
    newRefreshToken: string,
    userId: string,
    absoluteExpiredAt: number,
  ) {
    const expiredAt = Date.now() + ms(this.refreshTokenExp);
    await this.sessionRepository.deleteByRefreshToken(oldRefreshToken);
    return this.sessionRepository.createSession({
      userId,
      refreshToken: newRefreshToken,
      expiredAt,
      absoluteExpiredAt,
    });
  }

  static async validateSession(refreshToken: string) {
    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);

    if (!session) return null;

    const now = Date.now();
    if (now > session.absoluteExpiredAt || now > session.expiredAt) {
      await this.sessionRepository.deleteByRefreshToken(refreshToken);
      return null;
    }

    const user = await this.userRepository.findById({
      id: session.userId,
    });

    // Delete the orphaned session if the user does not exist
    if (!user) {
      await this.sessionRepository.deleteByRefreshToken(refreshToken);
      return null;
    }

    return { session, user };
  }

  static async deleteSession(refreshToken: string) {
    await this.sessionRepository.deleteByRefreshToken(refreshToken);
  }
}
