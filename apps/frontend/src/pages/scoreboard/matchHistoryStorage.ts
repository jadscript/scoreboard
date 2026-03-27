export type MatchHistoryTeamSide = 'team1' | 'team2'

const STORAGE_KEY = 'scoreboard/match-history'
const PERSIST_VERSION = 1
const MAX_ENTRIES = 80

export interface SnapshotLike {
  points: { team1: number; team2: number }
  games: { team1: number; team2: number }
  sets: { team1: number; team2: number }
  isTiebreak: boolean
  setHistory: { team1: number; team2: number }[]
}

export interface SavedMatchRecord {
  id: string
  savedAt: string
  team1Name: string
  team2Name: string
  gamesToWinSet: 2 | 3 | 4 | 5 | 6
  setsToWinMatch: number
  /** Placar final em sets. */
  finalSets: { team1: number; team2: number }
  /** Games de cada set concluído (espelho de setHistory no fim da partida). */
  setGameScores: { team1: number; team2: number }[]
  /** Ordem de cada ponto marcado na partida. */
  pointEvents: MatchHistoryTeamSide[]
}

interface PersistedFile {
  v: number
  items: SavedMatchRecord[]
}

function isTeamSide(x: unknown): x is MatchHistoryTeamSide {
  return x === 'team1' || x === 'team2'
}

function isScore(x: unknown): x is { team1: number; team2: number } {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    typeof o.team1 === 'number' &&
    typeof o.team2 === 'number' &&
    Number.isFinite(o.team1) &&
    Number.isFinite(o.team2)
  )
}

function isSavedMatchRecord(x: unknown): x is SavedMatchRecord {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.savedAt !== 'string') return false
  if (typeof o.team1Name !== 'string' || typeof o.team2Name !== 'string') return false
  if (!isScore(o.finalSets)) return false
  if (!Array.isArray(o.setGameScores) || !o.setGameScores.every(isScore)) return false
  if (!Array.isArray(o.pointEvents) || !o.pointEvents.every(isTeamSide)) return false
  if (typeof o.setsToWinMatch !== 'number') return false
  const g = o.gamesToWinSet
  if (g !== 2 && g !== 3 && g !== 4 && g !== 5 && g !== 6) return false
  return true
}

function parseStored(raw: string | null): SavedMatchRecord[] {
  if (raw === null || raw === '') return []
  try {
    const data = JSON.parse(raw) as unknown
    if (typeof data !== 'object' || data === null) return []
    const o = data as Record<string, unknown>
    if (o.v !== PERSIST_VERSION) return []
    if (!Array.isArray(o.items)) return []
    return o.items.filter(isSavedMatchRecord)
  } catch {
    return []
  }
}

function serialize(items: SavedMatchRecord[]): string {
  const payload: PersistedFile = { v: PERSIST_VERSION, items }
  return JSON.stringify(payload)
}

/** Infere quem marcou o ponto entre dois snapshots consecutivos (histórico de undo). */
export function inferScoringTeam(prior: SnapshotLike, after: SnapshotLike): MatchHistoryTeamSide {
  if (after.setHistory.length > prior.setHistory.length) {
    const g = after.setHistory[after.setHistory.length - 1]
    return g.team1 > g.team2 ? 'team1' : 'team2'
  }
  if (after.games.team1 !== prior.games.team1 || after.games.team2 !== prior.games.team2) {
    if (after.games.team1 > prior.games.team1) return 'team1'
    if (after.games.team2 > prior.games.team2) return 'team2'
  }
  if (after.points.team1 > prior.points.team1) return 'team1'
  if (after.points.team2 > prior.points.team2) return 'team2'
  return 'team1'
}

export function buildPointEventsFromHistory(
  history: SnapshotLike[],
  current: SnapshotLike,
): MatchHistoryTeamSide[] {
  const out: MatchHistoryTeamSide[] = []
  for (let i = 0; i < history.length; i++) {
    const prior = history[i]
    const after = i + 1 < history.length ? history[i + 1]! : current
    out.push(inferScoringTeam(prior, after))
  }
  return out
}

export function loadMatchHistory(): SavedMatchRecord[] {
  if (typeof globalThis.localStorage === 'undefined') return []
  return parseStored(globalThis.localStorage.getItem(STORAGE_KEY))
}

export function appendSavedMatch(entry: Omit<SavedMatchRecord, 'id' | 'savedAt'>): SavedMatchRecord | null {
  if (typeof globalThis.localStorage === 'undefined') return null
  const record: SavedMatchRecord = {
    ...entry,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  }
  const prev = loadMatchHistory()
  const next = [record, ...prev].slice(0, MAX_ENTRIES)
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, serialize(next))
    return record
  } catch {
    return null
  }
}
