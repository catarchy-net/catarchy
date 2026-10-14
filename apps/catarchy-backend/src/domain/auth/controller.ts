import { jwt } from "@elysiajs/jwt";
import Elysia, { status, StatusMap, t } from "elysia";
import ms from "ms";

import { setAuthCookie } from "@/lib/cookie";
import { ENVIRONMENT, getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { withCommonError } from "@/lib/response";

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
    .post(
      "/refresh",
      async ({ cookie, authService, accessJwt, refreshJwt }) => {
        const oldRefreshToken = cookie.refreshToken.value;

        if (!oldRefreshToken) {
          return status(401, { message: "Invalid or expired refresh token" });
        }

        // 1. Verify JWT signature
        const payload = await refreshJwt.verify(oldRefreshToken);
        if (!payload || !payload.sub) {
          return status(401, { message: "Invalid or expired refresh token" });
        }

        // 2. Validate session existence and expiry in DB
        const result = await authService.validateSession(oldRefreshToken);
        if (!result?.session || !result.user) {
          return status(401, { message: "Invalid or expired refresh token" });
        }

        const { session, user } = result;

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
        response: withCommonError({
          [StatusMap.OK]: "auth.refresh.response",
          [StatusMap.Unauthorized]: "auth.refresh.unauthorized",
        }),
      },
    )
    .post(
      "/sign-in-remilianet",
      async ({ body, cookie, authService, accessJwt, refreshJwt }) => {
        const user = await authService.signInWithRemiliaAccessToken(
          body.accessToken,
        );

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
        body: "auth.sign-in-remilianet.body",
        cookie: t.Cookie({
          accessToken: t.Optional(t.String()),
          refreshToken: t.Optional(t.String()),
        }),
        response: withCommonError({
          [StatusMap.OK]: "auth.sign-in-remilianet.response",
          [StatusMap.Unauthorized]: "auth.sign-in-remilianet.unauthorized",
          [StatusMap["Bad Gateway"]]: "auth.sign-in-remilianet.bad-gateway",
        }),
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
          return status(401, { message: "Unauthorized" });
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
        response: withCommonError({
          [StatusMap.OK]: "auth.check.response",
          [StatusMap.Unauthorized]: "auth.check.unauthorized",
        }),
      },
    )
    .post(
      "/sign-out",
      async ({ cookie, authService }) => {
        const refreshToken = cookie.refreshToken.value;

        if (refreshToken) {
          await authService.deleteSession(refreshToken).catch((error) => {
            logger.info(
              `Failed to delete session for refresh token: ${refreshToken}. Error: ${error.message}`,
            );
          });
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
        response: withCommonError({
          [StatusMap.OK]: "auth.sign-out.response",
        }),
      },
    );
};
