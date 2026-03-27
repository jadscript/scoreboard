import type { TeamDraft } from './types'

export function formatTeamDisplayName(names: string[]): string {
  const parts = names.map((n) => n.trim()).filter((n) => n.length > 0)
  if (parts.length === 0) return 'Time'
  return parts.join(' / ')
}

export function resolveTeamIndexByName(teams: TeamDraft[], name: string): number {
  const t = name.trim().toLowerCase()
  if (t.length === 0) return -1
  return teams.findIndex(
    (x) => formatTeamDisplayName(x.playerNames).toLowerCase() === t,
  )
}

export function normalizePlayerKey(name: string): string {
  return name.trim().toLowerCase()
}

/** Chaves (nome normalizado) já usadas noutras posições dos times — não podem repetir neste slot. */
export function getExcludedNameKeys(
  teams: TeamDraft[],
  teamIndex: number,
  playerIndex: number,
): Set<string> {
  const s = new Set<string>()
  teams.forEach((t, ti) => {
    t.playerNames.forEach((n, pi) => {
      if (ti === teamIndex && pi === playerIndex) return
      const k = normalizePlayerKey(n)
      if (k.length > 0) s.add(k)
    })
  })
  return s
}
