import { AuthRepository } from "./repository";
import { EmailVerificationRepository } from "./email-verification.repository";
import { SessionRepository } from "./session.repository";
import { randomInt } from "node:crypto";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/error";
import { UserRepository } from "../user/repository";
import bcrypt from "bcryptjs";
import { getDatabase, table } from "../../infra/db";
import { eq } from "drizzle-orm";
import { runAtomic } from "../../lib/atomic";

export abstract class AuthService {
  // Configurations
  static emailCodeDuration: number = 15 * 60 * 1000; // 15 minutes
  static emailCodeCooldown: number = 15 * 1000; // 15 seconds

  // database (transaction)
  private static get db() {
    return getDatabase();
  }

  // Repositories
  private static authRepository = AuthRepository;
  private static emailVerificationRepository = EmailVerificationRepository;
  private static userRepository = UserRepository;
  private static sessionRepository = SessionRepository;

  static async addVerificationRecord({
    code,
    email,
  }: {
    code: string;
    email: string;
  }) {
    const expiredAt = Date.now() + this.emailCodeDuration;

    const existing =
      await this.emailVerificationRepository.findRecentVerification({
        email,
      });

    if (existing?.createdAt) {
      const createdAtMs = new Date(existing.createdAt + "Z").getTime();
      const cooldownEnd = createdAtMs + this.emailCodeCooldown;

      if (Date.now() < cooldownEnd) {
        throw new ConflictError(
          "A verification code has already been sent to this email. Please wait before requesting a new one.",
          {
            waitUntil: cooldownEnd,
          },
        );
      }
    }

    const verification =
      await this.emailVerificationRepository.createEmailVerification({
        email,
        code,
        expiredAt,
      });

    return verification;
  }

  static async verifyEmailCode({
    email,
    code,
  }: {
    email: string;
    code: string;
  }) {
    const record = await this.emailVerificationRepository.findValidVerification(
      {
        email,
        code,
      },
    );

    if (!record) {
      const anyRecord =
        await this.emailVerificationRepository.findVerificationByEmailAndCode({
          email,
          code,
        });

      if (anyRecord?.verified) {
        throw new ConflictError(
          "This verification code has already been used.",
        );
      }

      throw new NotFoundError("Invalid or expired verification code");
    }

    const updated =
      await this.emailVerificationRepository.updateVerificationAsUsed(
        record.id,
      );

    if (!updated) {
      throw new ConflictError(
        "Failed to verify code. It may have already been used.",
      );
    }

    return true;
  }

  static async deleteVerification(id: string) {
    await this.emailVerificationRepository.deleteVerificationById(id);
  }

  static async signUpWithEmailAndPassword({
    email,
    password,
    handle,
  }: {
    email: string;
    password: string;
    handle: string;
  }) {
    const verified =
      await this.emailVerificationRepository.findVerifiedEmailRecord({
        email,
      });

    if (!verified) {
      throw new ForbiddenError("Email has not been verified.");
    }

    const existingAuth = await this.authRepository.findAuthByEmail({ email });

    if (existingAuth) {
      throw new ConflictError("An account with this email already exists.");
    }

    const existingHandle = await this.userRepository.findByHandle({ handle });

    if (existingHandle) {
      throw new ConflictError("Handle already taken.");
    }

    const passwordHashed = bcrypt.hashSync(password, 10);
    const userId = crypto.randomUUID();

    const [userResults] = await runAtomic(this.db, [
      this.db.insert(table.user).values({ id: userId, handle }).returning(),
      this.db.insert(table.auth).values({
        provider: "email_password",
        email,
        password: passwordHashed,
        userId,
      }),
      this.db
        .delete(table.emailVerification)
        .where(eq(table.emailVerification.email, email)),
    ] as const);

    return userResults[0];
  }

  static async signInWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const commonMessage =
      "Failed to sign in. Please check your email and password and try again.";

    const authRecord = await this.authRepository.findAuthByEmail({
      email,
    });

    if (!authRecord) {
      throw new NotFoundError(commonMessage);
    }

    if (!authRecord.password) {
      throw new ForbiddenError(
        "This email is registered with a different sign-in method.",
      );
    }

    const passwordMatch = bcrypt.compareSync(password, authRecord.password);

    if (!passwordMatch) {
      throw new ForbiddenError(commonMessage);
    }

    const user = await this.userRepository.findById({ id: authRecord.userId });

    if (!user) {
      throw new NotFoundError(commonMessage);
    }

    return user;
  }

  static generateCode() {
    return randomInt(0, 999999).toString().padStart(6, "0");
  }

  static async findUserById(id: string) {
    return this.userRepository.findById({ id });
  }

  static readonly refreshTokenDuration = 7 * 24 * 60 * 60 * 1000; // 7 days

  static async createSession(userId: string, refreshToken: string) {
    const expiredAt = Date.now() + this.refreshTokenDuration;
    return this.sessionRepository.createSession({
      userId,
      refreshToken,
      expiredAt,
    });
  }

  static async rotateSession(
    oldRefreshToken: string,
    newRefreshToken: string,
    userId: string,
  ) {
    const expiredAt = Date.now() + this.refreshTokenDuration;
    await this.sessionRepository.deleteByRefreshToken(oldRefreshToken);
    return this.sessionRepository.createSession({
      userId,
      refreshToken: newRefreshToken,
      expiredAt,
    });
  }

  static async validateSession(refreshToken: string) {
    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);

    if (!session) return null;
    if (Date.now() > session.expiredAt) {
      await this.sessionRepository.deleteByRefreshToken(refreshToken);
      return null;
    }

    return session;
  }

  static async deleteSession(refreshToken: string) {
    await this.sessionRepository.deleteByRefreshToken(refreshToken);
  }
}
