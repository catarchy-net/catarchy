import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";

import { ENVIRONMENT, initEnv } from "@/lib/env";

import { authRouter } from "./controller";
import { AuthService } from "./service";

initEnv({
  ENVIRONMENT: ENVIRONMENT.LOCAL,
  CORS_ORIGIN: "http://localhost:5173",
  ANTHROPIC_API_KEY: "fixture-anthropic",
  OPENAI_API_KEY: "fixture-openai",
  JWT_SECRET: "fixture-access-secret-at-least-32-characters",
  REFRESH_JWT_SECRET: "fixture-refresh-secret-at-least-32-characters",
});

afterEach(() => mock.restore());

const user = { id: "fixture-user", handle: "fixture_user" };

describe("RemiliaNET-only authentication API", () => {
  test.each([
    ["POST", "/send-verification-email"],
    ["PATCH", "/verify-email-code"],
    ["POST", "/sign-up-email"],
    ["POST", "/sign-in-email"],
    ["POST", "/send-reset-password-email"],
    ["POST", "/reset-password"],
  ])("returns 404 for removed %s %s", async (method, path) => {
    const response = await authRouter().handle(
      new Request(`http://localhost/auth${path}`, { method }),
    );

    expect(response.status).toBe(404);
  });

  test("requires authentication for session checks and refresh", async () => {
    const app = authRouter();
    const check = await app.handle(new Request("http://localhost/auth/check"));
    const refresh = await app.handle(
      new Request("http://localhost/auth/refresh", { method: "POST" }),
    );

    expect(check.status).toBe(401);
    expect(refresh.status).toBe(401);
  });

  test("signs in with RemiliaNET, checks and refreshes the session, and signs out", async () => {
    const session = {
      id: "fixture-session",
      userId: user.id,
      refreshToken: "fixture-refresh-token",
      expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      absoluteExpiredAt: Date.now() + 90 * 24 * 60 * 60 * 1000,
      createdAt: null,
    };
    const signIn = spyOn(
      AuthService,
      "signInWithRemiliaAccessToken",
    ).mockResolvedValue(user);
    const createSession = spyOn(AuthService, "createSession").mockResolvedValue(
      session,
    );
    const rotateSession = spyOn(AuthService, "rotateSession").mockResolvedValue(
      session,
    );
    const deleteSession = spyOn(AuthService, "deleteSession").mockResolvedValue(
      undefined,
    );
    const app = authRouter();
    const signedIn = await app.handle(
      new Request("http://localhost/auth/sign-in-remilianet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "fixture-remilia-token" }),
      }),
    );

    expect(signedIn.status).toBe(200);
    expect(await signedIn.json()).toEqual({
      message: "Signed in successfully",
      userId: user.id,
      handle: user.handle,
    });
    expect(signIn).toHaveBeenCalledWith("fixture-remilia-token");

    const cookies = signedIn.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    for (const cookie of cookies) {
      expect(cookie).toContain("HttpOnly");
    }
    const cookieHeader = cookies
      .map((cookie) => cookie.split(";")[0])
      .join("; ");
    const refreshToken = createSession.mock.calls[0]![1];
    expect(createSession).toHaveBeenCalledWith(user.id, expect.any(String));

    const checked = await app.handle(
      new Request("http://localhost/auth/check", {
        headers: { Cookie: cookieHeader },
      }),
    );
    expect(checked.status).toBe(200);
    expect(await checked.json()).toEqual({
      ok: true,
      userId: user.id,
      handle: user.handle,
    });

    spyOn(AuthService, "validateSession").mockResolvedValue({
      session: { ...session, refreshToken },
      user: { ...user, createdAt: null, updatedAt: null },
    });
    const refreshed = await app.handle(
      new Request("http://localhost/auth/refresh", {
        method: "POST",
        headers: { Cookie: cookieHeader },
      }),
    );

    expect(refreshed.status).toBe(200);
    expect(rotateSession).toHaveBeenCalledWith(
      refreshToken,
      expect.any(String),
      user.id,
      session.absoluteExpiredAt,
    );

    const refreshedCookies = refreshed.headers
      .getSetCookie()
      .map((cookie) => cookie.split(";")[0])
      .join("; ");
    const signedOut = await app.handle(
      new Request("http://localhost/auth/sign-out", {
        method: "POST",
        headers: { Cookie: refreshedCookies },
      }),
    );

    expect(signedOut.status).toBe(200);
    expect(deleteSession).toHaveBeenCalledWith(rotateSession.mock.calls[0]![1]);
    for (const cookie of signedOut.headers.getSetCookie()) {
      expect(cookie).toContain("Max-Age=0");
    }
  });
});
