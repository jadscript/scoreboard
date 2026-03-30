import type { TeamDraft } from './types'

export function formatTeamDisplayName(names: string[]): string {
  const parts = names.map((n) => n.trim()).filter((n) => n.length > 0)
  if (parts.length === 0) return 'Time'
  return parts.join(' / ')
}

/** Lê o nome exibido do time em `count` vagas (simples ou dupla). */
export function parseDisplayToSlots(name: string, count: 1 | 2): string[] {
  const parts = name.split(/\s*\/\s*/).map((s) => s.trim())
  const nonempty = parts.filter((s) => s.length > 0)
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(nonempty[i] ?? '')
  }
  return out
}

/**
 * Chave estável para agrupar duplas no ranking: mesmos jogadores contam junto
 * ainda que a ordem no placar seja "B / A" ou "A / B".
 * Simples: uma chave por nome em minúsculas.
 */
export function canonicalTeamKeyFromDisplay(teamName: string): {
  key: string
  displayName: string
} {
  const parts = teamName
    .trim()
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  if (parts.length === 0) {
    return { key: '__empty__', displayName: 'Time' }
  }
  if (parts.length === 1) {
    const p = parts[0]
    return { key: p.toLowerCase(), displayName: p }
  }
  const sorted = [...parts].sort((a, b) => a.localeCompare(b, 'pt'))
  const key = sorted.map((p) => p.toLowerCase()).join('|')
  const displayName = sorted.join(' / ')
  return { key, displayName }
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
