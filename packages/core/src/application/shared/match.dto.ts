import type { GameType, Gender, MatchStatus, MatchType, PointScorer } from '../../domain/shared/types'

export interface PlayerDto {
  id: string
  name: string
  userId: string
  gender: Gender
  whatsapp: string | null
  photoUrl: string | null
}

export interface TeamDto {
  id: string
  name: string
  players: PlayerDto[]
}

export interface GameDto {
  id: string
  type: GameType
  score: { team1: string; team2: string }
  winner: PointScorer | null
  isFinished: boolean
}

export interface SetDto {
  id: string
  score: { team1: number; team2: number }
  winner: PointScorer | null
  isFinished: boolean
  isSuperTiebreak: boolean
  currentGame: GameDto | null
  games: GameDto[]
}

export interface MatchDto {
  id: string
  team1: TeamDto
  team2: TeamDto
  matchType: MatchType | null
  status: MatchStatus
  winner: PointScorer | null
  setScore: { team1: number; team2: number }
  currentSet: SetDto | null
  sets: SetDto[]
}
