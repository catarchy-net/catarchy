import { randomBytes, randomInt } from "node:crypto";

import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import ms from "ms";
import { uuidv7 } from "uuidv7";
import { type Hex, verifyMessage } from "viem";
import { parseSiweMessage, validateSiweMessage } from "viem/siwe";

import { UserRepository } from "@/domain/user";
import { getDatabase, table } from "@/infra/db";
import { runAtomic } from "@/lib/atomic";
import { ENVIRONMENT, getEnv } from "@/lib/env";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/error";

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
      await this.emailVerificationRepository.findRecentVerification({
        email,
      }),
      await this.authRepository.findAuthByEmail({ email }),
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
      const cooldownEnd = createdAtMs + ms(this.emailCodeCooldown);

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

  static async addResetPasswordVerificationRecord({
    code,
    email,
  }: {
    code: string;
    email: string;
  }) {
    const expiredAt = Date.now() + ms(AuthService.emailCodeDuration);

    const [existingVerification, auth] = await Promise.all([
      this.emailVerificationRepository.findRecentVerification({ email }),
      this.authRepository.findAuthByEmail({ email }),
    ]);

    if (!auth) {
      throw new NotFoundError("No account found with this email address.");
    }

    if (existingVerification?.createdAt) {
      const createdAtMs = new Date(
        `${existingVerification.createdAt}Z`,
      ).getTime();
      const cooldownEnd = createdAtMs + ms(this.emailCodeCooldown);

      if (Date.now() < cooldownEnd) {
        throw new ConflictError(
          "A verification code has already been sent to this email. Please wait before requesting a new one.",
          { waitUntil: cooldownEnd },
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

  static async resetPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const verified =
      await this.emailVerificationRepository.findVerifiedEmailRecord({
        email,
      });

    if (!verified) {
      throw new ForbiddenError(
        "Email has not been verified. Please verify your email before resetting your password.",
      );
    }

    const auth = await this.authRepository.findAuthByEmail({ email });

    if (!auth) {
      throw new NotFoundError("No account found with this email address.");
    }

    const passwordHashed = bcrypt.hashSync(password, 10);
    await this.authRepository.updatePassword({ email, passwordHashed });
    await this.emailVerificationRepository.deleteVerificationByEmail(email);
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
      throw new ForbiddenError(
        "Email has not been verified. Please verify your email before signing up.",
      );
    }

    const existingAuth = await this.authRepository.findAuthByEmail({
      email,
    });

    if (existingAuth) {
      throw new ConflictError("An account with this email already exists.", {
        conflicted: "email",
      });
    }

    const existingHandle = await this.userRepository.findByHandle({
      handle,
    });

    if (existingHandle) {
      throw new ConflictError("Handle already taken.", {
        conflicted: "handle",
      });
    }

    const passwordHashed = bcrypt.hashSync(password, 10);
    const userId = uuidv7();

    await runAtomic(this.db, [
      this.userRepository.create({ id: userId, handle }),
      this.authRepository.createEmailAuth({ email, passwordHashed, userId }),
    ]);

    await this.emailVerificationRepository.deleteVerificationByEmail(email);

    return { id: userId, handle };
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

    const user = await this.userRepository.findById({
      id: authRecord.userId,
    });

    if (!user) {
      throw new NotFoundError(commonMessage);
    }

    return {
      id: user.id,
      handle: user.handle,
    };
  }

  static generateCode() {
    return randomInt(0, 999999).toString().padStart(6, "0");
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

  static async issueSiweNonce({
    walletAddress,
  }: {
    walletAddress: `0x${string}`;
  }) {
    const nonce = randomBytes(16).toString("hex");

    const expiredAt = Date.now() + ms("10m");

    const [row] = await this.db
      .insert(table.siweNonceTable)
      .values({
        id: uuidv7(),
        walletAddress: walletAddress.toLowerCase(),
        nonce,
        expiredAt,
      })
      .returning({
        id: table.siweNonceTable.id,
        walletAddress: table.siweNonceTable.walletAddress,
        createdAt: table.siweNonceTable.createdAt,
        expiredAt: table.siweNonceTable.expiredAt,
        nonce: table.siweNonceTable.nonce,
      });

    return row;
  }

  static async signInWithWallet({
    message,
    signature,
  }: {
    message: string;
    signature: Hex;
  }) {
    const env = getEnv();
    const parsed = parseSiweMessage(message);

    if (!parsed?.address || !parsed?.nonce) {
      throw new ForbiddenError("Failed to parse SIWE message");
    }

    const walletAddress = parsed.address.toLowerCase() as `0x${string}`;

    const [nonceRecord] = await this.db
      .select()
      .from(table.siweNonceTable)
      .where(
        and(
          eq(table.siweNonceTable.walletAddress, walletAddress),
          eq(table.siweNonceTable.nonce, parsed.nonce),
          gt(table.siweNonceTable.expiredAt, Date.now()),
        ),
      )
      .limit(1);

    if (!nonceRecord) {
      throw new ForbiddenError("Invalid or expired SIWE nonce");
    }

    const validMessage = validateSiweMessage({
      message: parsed,
      address: parsed.address,
      domain:
        env.ENVIRONMENT === ENVIRONMENT.LOCAL
          ? "localhost:5173"
          : "catarchy.net",
      nonce: nonceRecord.nonce,
      scheme: env.ENVIRONMENT === ENVIRONMENT.LOCAL ? "http" : "https",
      time: new Date(),
    });

    if (!validMessage) {
      throw new ForbiddenError("Failed to sign in, please check again");
    }

    const validSignature = await verifyMessage({
      address: parsed.address,
      message,
      signature,
    }).catch(() => false);

    if (!validSignature) {
      throw new ForbiddenError("Failed to sign in, please check again");
    }

    await this.db
      .delete(table.siweNonceTable)
      .where(eq(table.siweNonceTable.id, nonceRecord.id));

    const auth = await this.authRepository.findAuthByWalletAddress({
      walletAddress,
    });

    if (!auth) {
      throw new NotFoundError("auth not found");
    }

    const user = await this.userRepository.findById({
      id: auth.userId,
    });

    if (!user) {
      throw new NotFoundError("user not found");
    }

    return {
      id: user.id,
      handle: user.handle,
    };
  }

  static async signUpWithWallet({
    walletAddress,
    handle,
  }: {
    walletAddress: `0x${string}`;
    handle: string;
  }) {
    const auth = await this.authRepository.findAuthByWalletAddress({
      walletAddress,
    });

    if (auth) {
      throw new ConflictError("Wallet already signed up");
    }

    const userId = uuidv7();

    await runAtomic(this.db, [
      this.userRepository.create({ id: userId, handle }),
      this.authRepository.createWalletAuth({ walletAddress, userId }),
    ]);

    return {
      id: userId,
      handle,
    };
  }
}
