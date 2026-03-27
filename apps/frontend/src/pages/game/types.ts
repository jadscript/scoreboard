export type GameFormat = 'singles' | 'doubles'

export const GAME_FORMAT_LABELS: Record<GameFormat, string> = {
  singles: 'Simples',
  doubles: 'Dupla',
}

export const GAME_FORMAT_OPTIONS: GameFormat[] = ['singles', 'doubles']

/** Games para vencer um set (2 a 6). */
export type GamesPerSetOption = 2 | 3 | 4 | 5 | 6

/** Vitórias em sets necessárias para vencer a partida (1 a 3). */
export type MatchSetsOption = 1 | 2 | 3

export function isSinglesFormat(f: GameFormat): boolean {
  return f === 'singles'
}

export function playersPerTeamForFormat(f: GameFormat): 1 | 2 {
  return f === 'singles' ? 1 : 2
}

export interface TeamDraft {
  id: string
  playerNames: string[]
}
