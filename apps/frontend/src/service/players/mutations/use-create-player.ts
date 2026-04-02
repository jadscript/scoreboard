import { useMutation } from "@tanstack/react-query";
import { createPlayer } from "../../../api/player";
import { useAuth } from "../../../hooks/useAuth";
import type { CreatePlayerInput } from "../../../api/player";

export function useCreatePlayer() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: (input: CreatePlayerInput) => createPlayer(token!, input),
  });
}
