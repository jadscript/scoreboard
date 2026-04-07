import { useQuery } from "@tanstack/react-query";
import { getPlayerByUserId } from "../../../api/player";
import { useAuth } from "../../../hooks/useAuth";

export function usePlayerByUserId(
  userId: string | undefined,
  enabled: boolean,
) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["players", "byUserId", userId],
    queryFn: () => getPlayerByUserId(token!, userId!),
    enabled: Boolean(token && userId && enabled),
    retry: false,
  });
}
