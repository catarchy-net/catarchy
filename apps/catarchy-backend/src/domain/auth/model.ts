import Elysia, { t } from "elysia";

export const authModel = new Elysia({ name: "model.auth" }).model({
  "auth.send-verification-email.body": t.Object({
    email: t.String({
      format: "email",
      error: "Invalid email address format",
      examples: ["user@example.com"],
      description:
        "The email address to which the verification code will be sent",
    }),
  }),
  "auth.send-verification-email.response": t.Object({
    message: t.String({
      description:
        "A message confirming that the verification email was sent successfully",
      examples: ["Verification email sent successfully"],
    }),
    expiredAt: t.Number({
      description: "The timestamp at which the verification code expires",
      examples: [1772639822606],
    }),
  }),
  "auth.send-verification-email.conflict": t.Object({
    message: t.String({
      description:
        "A message indicating that a verification email has already been sent",
      examples: [
        "A verification email has already been sent to this address",
        "An account with this email already exists. Please sign in or use a different email.",
      ],
    }),
    data: t.Object({
      waitUntil: t.Number({
        description:
          "The timestamp until which the user must wait before requesting a new verification email",
        examples: [1772639822606],
      }),
    }),
  }),
  "auth.send-verification-email.bad-gateway": t.Object({
    message: t.String({
      description:
        "A message indicating that Third-party email service failed to send the verification email",
      examples: ["Failed to send verification email"],
    }),
  }),
  "auth.verify-email-code.body": t.Object({
    email: t.String({
      format: "email",
      error: "Invalid email address format",
      examples: ["user@example.com"],
      description: "The email address associated with the verification code",
    }),
    code: t.String({
      minLength: 6,
      maxLength: 6,
      pattern: "^[0-9]{6}$",
      error: "Invalid verification code format",
      examples: ["123456"],
      description: "The 6-digit verification code sent to the user's email",
    }),
  }),
  "auth.verify-email-code.response": t.Object({
    message: t.String({
      description:
        "A message confirming that the email was verified successfully",
      examples: ["Email verified successfully"],
    }),
  }),
  "auth.verify-email-code.not-found": t.Object({
    message: t.String({
      description:
        "A message indicating that the verification code is invalid or expired",
      examples: ["Invalid or expired verification code"],
    }),
  }),
  "auth.verify-email-code.conflict": t.Object({
    message: t.String({
      description:
        "A message indicating that the verification code has already been used",
      examples: ["This verification code has already been used."],
    }),
  }),
  "auth.sign-up-email.body": t.Object({
    email: t.String({
      format: "email",
      error: "Invalid email address format",
      examples: ["user@example.com"],
      description: "The email address to register with",
    }),
    password: t.String({
      minLength: 8,
      error: "Password must be at least 8 characters",
      description: "The password for the new account",
    }),
    handle: t.String({
      minLength: 4,
      maxLength: 15,
      pattern: "^[a-z0-9_]+$",
      error:
        "Handle must be 4-15 characters and contain only letters, numbers, or underscores",
      examples: ["catlover42"],
      description: "Unique username handle",
    }),
  }),
  "auth.sign-up-email.response": t.Object({
    message: t.String({
      description:
        "A message confirming that the account was created successfully",
      examples: ["Account created successfully"],
    }),
    userId: t.String({
      description: "The ID of the newly created user",
    }),
  }),
  "auth.sign-up-email.forbidden": t.Object({
    message: t.String({
      description: "A message indicating that the email has not been verified",
      examples: ["Email has not been verified."],
    }),
  }),
  "auth.sign-up-email.conflict": t.Object({
    message: t.String({
      description:
        "A message indicating that the handle or email is already taken",
      examples: ["Handle already taken"],
    }),
  }),
  "auth.sign-in-email.body": t.Object({
    email: t.String({
      format: "email",
      error: "Invalid email address format",
      examples: ["user@example.com"],
      description: "The email address to sign in with",
    }),
    password: t.String({
      minLength: 1,
      error: "Please enter your password.",
      description: "The account password",
    }),
  }),
  "auth.sign-in-email.response": t.Object({
    message: t.String({
      description: "A message confirming successful sign in",
      examples: ["Signed in successfully"],
    }),
    userId: t.String({
      description: "The ID of the signed-in user",
    }),
    handle: t.String({
      description: "The handle of the signed-in user",
    }),
  }),
  "auth.sign-in-email.not-found": t.Object({
    message: t.String({
      description:
        "A message indicating sign in failed due to wrong credentials",
      examples: [
        "Failed to sign in. Please check your email and password and try again.",
      ],
    }),
  }),
  "auth.sign-in-email.forbidden": t.Object({
    message: t.String({
      description:
        "A message indicating the account uses a different sign-in method or wrong password",
      examples: ["This email is registered with a different sign-in method."],
    }),
  }),
  "auth.refresh.response": t.Object({
    message: t.String({
      description: "A message confirming successful token refresh",
      examples: ["Token refreshed successfully"],
    }),
  }),
  "auth.refresh.unauthorized": t.Object({
    message: t.String({
      description:
        "A message indicating the refresh token is invalid or expired",
      examples: ["Invalid or expired refresh token"],
    }),
  }),
  "auth.sign-out.response": t.Object({
    message: t.String({
      description: "A message confirming successful sign out",
      examples: ["Signed out successfully"],
    }),
  }),
  "auth.check.response": t.Object({
    ok: t.Boolean({
      description: "Whether the user is authenticated",
      examples: [true],
    }),
    userId: t.String({
      description: "The ID of the authenticated user",
    }),
    handle: t.String({
      description: "The handle of the authenticated user",
    }),
  }),
  "auth.check.unauthorized": t.Object({
    message: t.String({
      description: "A message indicating the user is not authenticated",
      examples: ["Unauthorized"],
    }),
  }),
  "auth.send-reset-password-email.body": t.Object({
    email: t.String({
      format: "email",
      error: "Invalid email address format",
      examples: ["user@example.com"],
      description: "The email address to send the password reset code to",
    }),
  }),
  "auth.send-reset-password-email.response": t.Object({
    message: t.String({
      description: "A message confirming that the reset code was sent",
      examples: ["Password reset email sent successfully"],
    }),
    expiredAt: t.Number({
      description: "The timestamp at which the reset code expires",
      examples: [1772639822606],
    }),
  }),
  "auth.send-reset-password-email.not-found": t.Object({
    message: t.String({
      description: "A message indicating no account exists with this email",
      examples: ["No account found with this email address."],
    }),
  }),
  "auth.send-reset-password-email.conflict": t.Object({
    message: t.String({
      description: "A message indicating a reset code was recently sent",
      examples: [
        "A verification code has already been sent to this email. Please wait before requesting a new one.",
      ],
    }),
    data: t.Object({
      waitUntil: t.Number({
        description: "The timestamp until which the user must wait",
        examples: [1772639822606],
      }),
    }),
  }),
  "auth.send-reset-password-email.bad-gateway": t.Object({
    message: t.String({
      description: "A message indicating the email service failed",
      examples: ["Failed to send password reset email"],
    }),
  }),
  "auth.reset-password.body": t.Object({
    email: t.String({
      format: "email",
      error: "Invalid email address format",
      examples: ["user@example.com"],
      description: "The email address associated with the account",
    }),
    password: t.String({
      minLength: 8,
      error: "Password must be at least 8 characters",
      description: "The new password",
    }),
  }),
  "auth.reset-password.response": t.Object({
    message: t.String({
      description: "A message confirming the password was reset",
      examples: ["Password reset successfully"],
    }),
  }),
  "auth.reset-password.forbidden": t.Object({
    message: t.String({
      description: "A message indicating the email has not been verified",
      examples: ["Email has not been verified."],
    }),
  }),
  "auth.reset-password.not-found": t.Object({
    message: t.String({
      description: "A message indicating no account exists with this email",
      examples: ["No account found with this email address."],
    }),
  }),
  "auth.siwe-nonce.body": t.Object({
    walletAddress: t.RegExp(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid wallet address format",
      examples: ["0x1234567890abcdef1234567890abcdef12345678"],
      description: "The wallet address to issue a SIWE nonce for",
    }),
  }),
  "auth.siwe-nonce.response": t.Object({
    nonce: t.String({
      description: "The nonce to be included in the SIWE message",
      examples: ["3f7a1c9e2b8d4f6a0c1e5b3d7a9f2c4e"],
    }),
    expiredAt: t.Number({
      description: "The timestamp at which the nonce expires",
      examples: [1772639822606],
    }),
  }),
  "auth.sign-in-wallet.body": t.Object({
    message: t.String({
      description: "The SIWE message that was signed by the wallet",
    }),
    signature: t.RegExp(/^0x[a-fA-F0-9]+$/, {
      error: "Invalid signature format",
      description: "The signature produced by signing the SIWE message",
    }),
  }),
  "auth.sign-in-wallet.response": t.Object({
    message: t.String({
      description: "A message confirming successful sign in",
      examples: ["Signed in successfully"],
    }),
    userId: t.String({
      description: "The ID of the signed-in user",
    }),
    handle: t.String({
      description: "The handle of the signed-in user",
    }),
  }),
  "auth.sign-in-wallet.not-found": t.Object({
    message: t.String({
      description:
        "A message indicating no account exists for this wallet address",
      examples: ["auth not found"],
    }),
  }),
  "auth.sign-in-wallet.forbidden": t.Object({
    message: t.String({
      description:
        "A message indicating the SIWE message or signature is invalid",
      examples: [
        "Failed to parse SIWE message",
        "Invalid or expired SIWE nonce",
        "Failed to sign in, please check again",
      ],
    }),
  }),
  "auth.sign-up-wallet.body": t.Object({
    walletAddress: t.RegExp(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid wallet address format",
      examples: ["0x1234567890abcdef1234567890abcdef12345678"],
      description: "The wallet address to register with",
    }),
    handle: t.String({
      minLength: 4,
      maxLength: 15,
      pattern: "^[a-z0-9_]+$",
      error:
        "Handle must be 4-15 characters and contain only letters, numbers, or underscores",
      examples: ["catlover42"],
      description: "Unique username handle",
    }),
  }),
  "auth.sign-up-wallet.response": t.Object({
    message: t.String({
      description:
        "A message confirming that the wallet account was created successfully",
      examples: ["Wallet signed up successfully"],
    }),
    userId: t.String({
      description: "The ID of the newly created user",
    }),
    handle: t.String({
      description: "The handle of the newly created user",
    }),
  }),
  "auth.sign-up-wallet.conflict": t.Object({
    message: t.String({
      description: "A message indicating the wallet is already signed up",
      examples: ["Wallet already signed up"],
    }),
  }),
});
