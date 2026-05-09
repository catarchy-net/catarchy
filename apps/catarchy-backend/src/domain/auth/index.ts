import { jwt } from "@elysiajs/jwt";
import Elysia, { status, StatusMap, t } from "elysia";
import ms from "ms";
import { EmailService } from "../../infra/email/service";
import { setAuthCookie } from "../../lib/cookie";
import { ENVIRONMENT, getEnv } from "../../lib/env";
import { ExternalServiceError } from "../../lib/error";
import { authModel } from "./model";
import { AuthService } from "./service";

export const authRouter = () => {
  const env = getEnv();
  const isProd = env.ENVIRONMENT === ENVIRONMENT.PRODUCTION;

  return new Elysia({
    prefix: "/auth",
    tags: ["Auth"],
  })
    .use(
      jwt({
        name: "accessJwt",
        secret: env.JWT_SECRET,
        exp: AuthService.accessTokenExp,
      }),
    )
    .use(
      jwt({
        name: "refreshJwt",
        secret: env.REFRESH_JWT_SECRET,
        exp: AuthService.refreshTokenExp,
      }),
    )
    .use(authModel)
    .decorate("authService", AuthService)
    .decorate("emailService", EmailService)
    .post(
      "/send-verification-email",
      async ({ body, authService, emailService }) => {
        const { email } = body;

        const code = authService.generateCode();
        const emailCodeDuration = authService.emailCodeDuration;

        const verification = await authService.addVerificationRecord({
          email,
          code,
        });

        try {
          await emailService.sendMail({
            to: email,
            subject: `${code} Verify your email for Catarchy`,
            html: `Please verify your email using the following code: <strong>${code}</strong>. This code will expire in ${ms(emailCodeDuration) / 60000} minutes.`,
          });
        } catch (error) {
          if (error instanceof ExternalServiceError) {
            await authService.deleteVerification(verification.id);
          }

          throw error;
        }

        return {
          message: "Verification email sent successfully",
          expiredAt: verification.expiredAt,
        };
      },
      {
        body: "auth.send-verification-email.body",
        response: {
          [StatusMap.OK]: "auth.send-verification-email.response",
          [StatusMap.Conflict]: "auth.send-verification-email.conflict",
          [StatusMap["Bad Gateway"]]:
            "auth.send-verification-email.bad-gateway",
        },
      },
    )
    .patch(
      "/verify-email-code",
      async ({ body, authService }) => {
        const { email, code } = body;

        await authService.verifyEmailCode({ email, code });

        return {
          message: "Email verified successfully",
        };
      },
      {
        body: "auth.verify-email-code.body",
        response: {
          [StatusMap.OK]: "auth.verify-email-code.response",
          [StatusMap["Not Found"]]: "auth.verify-email-code.not-found",
          [StatusMap.Conflict]: "auth.verify-email-code.conflict",
        },
      },
    )
    .post(
      "/sign-up-email",
      async ({ body, authService }) => {
        const { email, password, handle } = body;

        const user = await authService.signUpWithEmailAndPassword({
          email,
          password,
          handle,
        });

        return {
          message: "Account created successfully",
          userId: user.id,
        };
      },
      {
        body: "auth.sign-up-email.body",
        response: {
          [StatusMap.OK]: "auth.sign-up-email.response",
          [StatusMap.Forbidden]: "auth.sign-up-email.forbidden",
          [StatusMap.Conflict]: "auth.sign-up-email.conflict",
        },
      },
    )
    .post(
      "/sign-in-email",
      async ({ body, cookie, authService, accessJwt, refreshJwt }) => {
        const { email, password } = body;

        const user = await authService.signInWithEmailAndPassword({
          email,
          password,
        });

        const [accessToken, refreshToken] = await Promise.all([
          accessJwt.sign({ sub: user.id, handle: user.handle }),
          refreshJwt.sign({ sub: user.id }),
        ]);

        await authService.createSession(user.id, refreshToken);

        setAuthCookie(
          cookie.accessToken,
          accessToken,
          ms(AuthService.accessTokenExp) / 1000,
          isProd,
        );
        setAuthCookie(
          cookie.refreshToken,
          refreshToken,
          ms(AuthService.refreshTokenExp) / 1000,
          isProd,
        );

        return {
          message: "Signed in successfully",
          userId: user.id,
          handle: user.handle,
        };
      },
      {
        body: "auth.sign-in-email.body",
        cookie: t.Cookie({
          accessToken: t.Optional(t.String()),
          refreshToken: t.Optional(t.String()),
        }),
        response: {
          [StatusMap.OK]: "auth.sign-in-email.response",
          [StatusMap["Not Found"]]: "auth.sign-in-email.not-found",
          [StatusMap.Forbidden]: "auth.sign-in-email.forbidden",
        },
      },
    )
    .post(
      "/refresh",
      async ({ cookie, authService, accessJwt, refreshJwt }) => {
        const oldRefreshToken = cookie.refreshToken.value;

        if (!oldRefreshToken) {
          return status(401, { message: "Invalid or expired refresh token" });
        }

        // 1. JWT 서명 검증
        const payload = await refreshJwt.verify(oldRefreshToken);
        if (!payload || !payload.sub) {
          return status(401, { message: "Invalid or expired refresh token" });
        }

        // 2. DB에서 세션 존재 여부 + 만료 검증
        const session = await authService.validateSession(oldRefreshToken);
        if (!session) {
          return status(401, { message: "Invalid or expired refresh token" });
        }

        const user = await authService.findUserById(session.userId);
        if (!user) {
          return status(401, { message: "Invalid or expired refresh token" });
        }

        // 3. Token rotation
        const [accessToken, newRefreshToken] = await Promise.all([
          accessJwt.sign({ sub: user.id, handle: user.handle }),
          refreshJwt.sign({ sub: user.id }),
        ]);

        await authService.rotateSession(
          oldRefreshToken,
          newRefreshToken,
          user.id,
          session.absoluteExpiredAt,
        );

        setAuthCookie(
          cookie.accessToken,
          accessToken,
          ms(AuthService.accessTokenExp) / 1000,
          isProd,
        );
        setAuthCookie(
          cookie.refreshToken,
          newRefreshToken,
          ms(AuthService.refreshTokenExp) / 1000,
          isProd,
        );

        return { message: "Token refreshed successfully" };
      },
      {
        cookie: t.Cookie({
          accessToken: t.Optional(t.String()),
          refreshToken: t.Optional(t.String()),
        }),
        response: {
          [StatusMap.OK]: "auth.refresh.response",
          [StatusMap.Unauthorized]: "auth.refresh.unauthorized",
        },
      },
    )
    .get(
      "/check",
      async ({ accessJwt, headers, cookie }) => {
        const authorization = headers.authorization;
        const token = authorization?.startsWith("Bearer ")
          ? authorization.slice(7)
          : ((cookie as Record<string, { value: string }>).accessToken?.value ??
            null);

        if (!token) {
          return status(400, { message: "No token provided" });
        }

        const payload = await accessJwt.verify(token);
        if (!payload || !payload.sub) {
          return status(401, { message: "Unauthorized" });
        }

        return {
          ok: true,
          userId: payload.sub as string,
          handle: payload.handle as string,
        };
      },
      {
        cookie: t.Cookie({
          accessToken: t.Optional(t.String()),
        }),
        response: {
          [StatusMap.OK]: "auth.check.response",
          [StatusMap.Unauthorized]: "auth.check.unauthorized",
          [StatusMap["Bad Request"]]: "auth.check.no-token-provided",
        },
      },
    )
    .post(
      "/sign-out",
      async ({ cookie, authService }) => {
        const refreshToken = cookie.refreshToken.value;
        if (refreshToken) {
          await authService.deleteSession(refreshToken);
        }
        cookie.accessToken.remove();
        cookie.refreshToken.remove();
        return { message: "Signed out successfully" };
      },
      {
        cookie: t.Cookie({
          accessToken: t.Optional(t.String()),
          refreshToken: t.Optional(t.String()),
        }),
        response: {
          [StatusMap.OK]: "auth.sign-out.response",
        },
      },
    )
    .post(
      "/send-reset-password-email",
      async ({ body, authService, emailService }) => {
        const { email } = body;

        const code = authService.generateCode();
        const emailCodeDuration = authService.emailCodeDuration;

        const verification =
          await authService.addResetPasswordVerificationRecord({ email, code });

        try {
          await emailService.sendMail({
            to: email,
            subject: `${code} Reset your Catarchy password`,
            html: `Reset your password using the following code: <strong>${code}</strong>. This code will expire in ${ms(emailCodeDuration) / 60000} minutes.`,
          });
        } catch (error) {
          if (error instanceof ExternalServiceError) {
            await authService.deleteVerification(verification.id);
          }

          throw error;
        }

        return {
          message: "Password reset email sent successfully",
          expiredAt: verification.expiredAt,
        };
      },
      {
        body: "auth.send-reset-password-email.body",
        response: {
          [StatusMap.OK]: "auth.send-reset-password-email.response",
          [StatusMap["Not Found"]]: "auth.send-reset-password-email.not-found",
          [StatusMap.Conflict]: "auth.send-reset-password-email.conflict",
          [StatusMap["Bad Gateway"]]:
            "auth.send-reset-password-email.bad-gateway",
        },
      },
    )
    .post(
      "/reset-password",
      async ({ body, authService }) => {
        const { email, password } = body;

        await authService.resetPassword({ email, password });

        return { message: "Password reset successfully" };
      },
      {
        body: "auth.reset-password.body",
        response: {
          [StatusMap.OK]: "auth.reset-password.response",
          [StatusMap.Forbidden]: "auth.reset-password.forbidden",
          [StatusMap["Not Found"]]: "auth.reset-password.not-found",
        },
      },
    );
};
