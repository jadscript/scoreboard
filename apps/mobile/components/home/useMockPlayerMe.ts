import { useQuery } from '@tanstack/react-query';

export interface PlayerMeResponse {
  id: string;
  name: string;
  email: string;
  gender: string;
  whatsapp: string;
  photoUrl: string;
}

export const MOCK_PLAYER_ME: PlayerMeResponse = {
  id: 'mock-player-id',
  name: 'Jogador Demo Silva',
  email: 'demo@example.com',
  gender: 'unknown',
  whatsapp: '',
  photoUrl: '',
};

export function useMockPlayerMe() {
  return useQuery({
    queryKey: ['players', 'me'],
    queryFn: async (): Promise<PlayerMeResponse> => MOCK_PLAYER_ME,
    staleTime: 60_000,
  });
}
