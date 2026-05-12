import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

type SendVerificationEmailPayload = Parameters<
  (typeof api.auth)["send-verification-email"]["post"]
>[0];
type VerifyEmailCodePayload = Parameters<
  (typeof api.auth)["verify-email-code"]["patch"]
>[0];

export async function sendVerificationEmail(
  payload: SendVerificationEmailPayload,
) {
  const { data, error } = await api.auth["send-verification-email"].post(
    payload,
  );
  if (error) throw error;
  return data;
}

export async function verifyEmailCode(payload: VerifyEmailCodePayload) {
  const { data, error } = await api.auth["verify-email-code"].patch(payload);
  if (error) throw error;
  return data;
}

export function sendVerificationEmailOptions() {
  return mutationOptions({
    mutationKey: ["auth", "send-verification-email"],
    mutationFn: sendVerificationEmail,
  });
}

export function verifyEmailCodeOptions() {
  return mutationOptions({
    mutationKey: ["auth", "verify-email-code"],
    mutationFn: verifyEmailCode,
  });
}
