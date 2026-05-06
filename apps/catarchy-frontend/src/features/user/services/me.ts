import { api } from "@/features/common";

export async function getMe() {
  return (await api.user.me.get()).data;
}

export function meOptions() {
  return {
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
  };
}
