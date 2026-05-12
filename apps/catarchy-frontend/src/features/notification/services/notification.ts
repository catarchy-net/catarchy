import { api } from "@/features/common";
import { mutationOptions } from "@tanstack/react-query";

type RegisterTokenPayload = Parameters<
  (typeof api.notification)["token"]["post"]
>[0];

export async function registerNotificationToken(
  payload: RegisterTokenPayload,
) {
  const { data, error } = await api.notification.token.post(payload);
  if (error) throw error;
  return data;
}

export function registerNotificationTokenOptions() {
  return mutationOptions({
    mutationKey: ["notification", "token"],
    mutationFn: registerNotificationToken,
  });
}
