import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

type SendResetEmailPayload = Parameters<(typeof api.auth)["send-reset-password-email"]["post"]>[0];
type VerifyResetCodePayload = Parameters<(typeof api.auth)["verify-email-code"]["patch"]>[0];
type ResetPasswordPayload = Parameters<(typeof api.auth)["reset-password"]["post"]>[0];

export async function sendResetPasswordEmail(payload: SendResetEmailPayload) {
  const { data, error } = await api.auth["send-reset-password-email"].post(payload);
  if (error) throw error;
  return data;
}

export async function verifyResetCode(payload: VerifyResetCodePayload) {
  const { data, error } = await api.auth["verify-email-code"].patch(payload);
  if (error) throw error;
  return data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data, error } = await api.auth["reset-password"].post(payload);
  if (error) throw error;
  return data;
}

export function sendResetEmailOptions() {
  return mutationOptions({
    mutationKey: ["auth", "send-reset-password-email"],
    mutationFn: sendResetPasswordEmail,
  });
}

export function verifyResetCodeOptions() {
  return mutationOptions({
    mutationKey: ["auth", "verify-email-code"],
    mutationFn: verifyResetCode,
  });
}

export function resetPasswordOptions() {
  return mutationOptions({
    mutationKey: ["auth", "reset-password"],
    mutationFn: resetPassword,
  });
}
