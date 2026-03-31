import { useQuery } from '@tanstack/react-query'
import { getPlayerMe } from '../api/player'
import { useAuth } from '../hooks/useAuth'

export function usePlayerMe() {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['players', 'me'],
    queryFn: () => getPlayerMe(token!),
    enabled: Boolean(token),
    staleTime: 60_000,
  })
}
