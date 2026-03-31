import { useAuth } from '../../hooks/useAuth'
import { usePlayerMe } from '../../queries/use-player-me'

export function HomePage() {
  const { token } = useAuth()
  const { data, isLoading, isError, error } = usePlayerMe()

  if (!token || isLoading) {
    return <div>Carregando…</div>
  }

  if (isError) {
    return (
      <div>
        Erro: {error instanceof Error ? error.message : String(error)}
      </div>
    )
  }

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
