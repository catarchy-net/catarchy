import bcrypt from "bcryptjs";
import ms from "ms";
import { randomInt } from "node:crypto";
import { getDatabase } from "../../infra/db";
import { runAtomic } from "../../lib/atomic";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/error";
import { CatRepository } from "../cat/repository";
import { CatStatRepository } from "../cat/cat-stat.repository";
import { UserRepository } from "../user/repository";
import { EmailVerificationRepository } from "./email-verification.repository";
import { AuthRepository } from "./repository";
import { SessionRepository } from "./session.repository";

export abstract class AuthService {
  // Configurations
  static readonly emailCodeDuration = "15m"; // 15 minutes
  static readonly emailCodeCooldown = "15m"; // 15 minutes

  static readonly accessTokenExp = "15m";
  static readonly refreshTokenExp = "7d";
  static readonly absoluteSessionExp = "90d";

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
    const expiredAt = Date.now() + ms(AuthService.emailCodeDuration);

    const [existingVerification, auth] = await Promise.all([
      await AuthService.emailVerificationRepository.findRecentVerification({
        email,
      }),
      await AuthService.authRepository.findAuthByEmail({ email }),
    ]);

    if (auth) {
      throw new ConflictError(
        "An account with this email already exists. Please sign in or use a different email.",
      );
    }

    if (existingVerification?.createdAt) {
      const createdAtMs = new Date(
        `${existingVerification.createdAt}Z`,
      ).getTime();
      const cooldownEnd = createdAtMs + ms(AuthService.emailCodeCooldown);

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
      await AuthService.emailVerificationRepository.createEmailVerification({
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
    const record =
      await AuthService.emailVerificationRepository.findValidVerification({
        email,
        code,
      });

    if (!record) {
      const anyRecord =
        await AuthService.emailVerificationRepository.findVerificationByEmailAndCode(
          {
            email,
            code,
          },
        );

      if (anyRecord?.verified) {
        throw new ConflictError(
          "This verification code has already been used.",
        );
      }

      throw new NotFoundError("Invalid or expired verification code");
    }

    const updated =
      await AuthService.emailVerificationRepository.updateVerificationAsUsed(
        record.id,
      );

    if (!updated) {
      throw new ConflictError(
        "Failed to verify code. It may have already been used.",
      );
    }

    return true;
  }

  static async addResetPasswordVerificationRecord({
    code,
    email,
  }: {
    code: string;
    email: string;
  }) {
    const expiredAt = Date.now() + ms(AuthService.emailCodeDuration);

    const [existingVerification, auth] = await Promise.all([
      AuthService.emailVerificationRepository.findRecentVerification({ email }),
      AuthService.authRepository.findAuthByEmail({ email }),
    ]);

    if (!auth) {
      throw new NotFoundError("No account found with this email address.");
    }

    if (existingVerification?.createdAt) {
      const createdAtMs = new Date(
        `${existingVerification.createdAt}Z`,
      ).getTime();
      const cooldownEnd = createdAtMs + ms(AuthService.emailCodeCooldown);

      if (Date.now() < cooldownEnd) {
        throw new ConflictError(
          "A verification code has already been sent to this email. Please wait before requesting a new one.",
          { waitUntil: cooldownEnd },
        );
      }
    }

    const verification =
      await AuthService.emailVerificationRepository.createEmailVerification({
        email,
        code,
        expiredAt,
      });

    return verification;
  }

  static async resetPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const verified =
      await AuthService.emailVerificationRepository.findVerifiedEmailRecord({
        email,
      });

    if (!verified) {
      throw new ForbiddenError(
        "Email has not been verified. Please verify your email before resetting your password.",
      );
    }

    const auth = await AuthService.authRepository.findAuthByEmail({ email });

    if (!auth) {
      throw new NotFoundError("No account found with this email address.");
    }

    const passwordHashed = bcrypt.hashSync(password, 10);
    await AuthService.authRepository.updatePassword({ email, passwordHashed });
    await AuthService.emailVerificationRepository.deleteVerificationByEmail(
      email,
    );
  }

  static async deleteVerification(id: string) {
    await AuthService.emailVerificationRepository.deleteVerificationById(id);
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
      await AuthService.emailVerificationRepository.findVerifiedEmailRecord({
        email,
      });

    if (!verified) {
      throw new ForbiddenError(
        "Email has not been verified. Please verify your email before signing up.",
      );
    }

    const existingAuth = await AuthService.authRepository.findAuthByEmail({
      email,
    });

    if (existingAuth) {
      throw new ConflictError("An account with this email already exists.", {
        conflicted: "email",
      });
    }

    const existingHandle = await AuthService.userRepository.findByHandle({
      handle,
    });

    if (existingHandle) {
      throw new ConflictError("Handle already taken.", {
        conflicted: "handle",
      });
    }

    const passwordHashed = bcrypt.hashSync(password, 10);
    const userId = crypto.randomUUID();
    const catId = crypto.randomUUID();

    await runAtomic(AuthService.db, [
      UserRepository.create({ id: userId, handle }),
      CatRepository.create({ id: catId, name: handle, servantId: userId }),
      CatStatRepository.create({ catId, growth: 0, emotion: 100 }),
      AuthRepository.createEmailAuth({ email, passwordHashed, userId }),
    ]);

    await AuthService.emailVerificationRepository.deleteVerificationByEmail(
      email,
    );

    return { id: userId };
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

    const authRecord = await AuthService.authRepository.findAuthByEmail({
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

    const user = await AuthService.userRepository.findById({
      id: authRecord.userId,
    });

    if (!user) {
      throw new NotFoundError(commonMessage);
    }

    return user;
  }

  static generateCode() {
    return randomInt(0, 999999).toString().padStart(6, "0");
  }

  static async findUserById(id: string) {
    return AuthService.userRepository.findById({ id });
  }

  static async createSession(userId: string, refreshToken: string) {
    const now = Date.now();
    const expiredAt = now + ms(AuthService.refreshTokenExp);
    const absoluteExpiredAt = now + ms(AuthService.absoluteSessionExp);
    return AuthService.sessionRepository.createSession({
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
    const expiredAt = Date.now() + ms(AuthService.refreshTokenExp);
    await AuthService.sessionRepository.deleteByRefreshToken(oldRefreshToken);
    return AuthService.sessionRepository.createSession({
      userId,
      refreshToken: newRefreshToken,
      expiredAt,
      absoluteExpiredAt,
    });
  }

  static async validateSession(refreshToken: string) {
    const session =
      await AuthService.sessionRepository.findByRefreshToken(refreshToken);

    if (!session) return null;

    const now = Date.now();
    if (now > session.absoluteExpiredAt || now > session.expiredAt) {
      await AuthService.sessionRepository.deleteByRefreshToken(refreshToken);
      return null;
    }

    return session;
  }

  static async deleteSession(refreshToken: string) {
    await AuthService.sessionRepository.deleteByRefreshToken(refreshToken);
  }
}
