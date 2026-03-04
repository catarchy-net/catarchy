import Elysia, { status, StatusMap } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./service";
import { EmailService } from "../../infra/email/service";
import { authModel } from "./model";
import { ExternalServiceError } from "../../lib/error";
import { type Env } from "../../lib/env";

export const authRouter = (env: Env) =>
  new Elysia({
    prefix: "/auth",
    tags: ["Auth"],
  })
    .use(jwt({ name: "accessJwt", secret: env.JWT_SECRET, exp: "15m" }))
    .use(jwt({ name: "refreshJwt", secret: env.REFRESH_JWT_SECRET, exp: "7d" }))
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
            html: `Please verify your email using the following code: <strong>${code}</strong>. This code will expire in ${emailCodeDuration / 60000} minutes.`,
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
      async ({ body, authService, accessJwt, refreshJwt }) => {
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

        return {
          message: "Signed in successfully",
          userId: user.id,
          handle: user.handle,
          accessToken,
          refreshToken,
        };
      },
      {
        body: "auth.sign-in-email.body",
        response: {
          [StatusMap.OK]: "auth.sign-in-email.response",
          [StatusMap["Not Found"]]: "auth.sign-in-email.not-found",
          [StatusMap.Forbidden]: "auth.sign-in-email.forbidden",
        },
      },
    )
    .post(
      "/refresh",
      async ({ body, authService, accessJwt, refreshJwt }) => {
        const { refreshToken: oldRefreshToken } = body;

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
        );

        return { accessToken, refreshToken: newRefreshToken };
      },
      {
        body: "auth.refresh.body",
        response: {
          [StatusMap.OK]: "auth.refresh.response",
          [StatusMap.Unauthorized]: "auth.refresh.unauthorized",
        },
      },
    )
    .post(
      "/sign-out",
      async ({ body, authService }) => {
        await authService.deleteSession(body.refreshToken);
        return { message: "Signed out successfully" };
      },
      {
        body: "auth.sign-out.body",
        response: {
          [StatusMap.OK]: "auth.sign-out.response",
        },
      },
    );
