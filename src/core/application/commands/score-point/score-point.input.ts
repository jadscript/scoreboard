import type { PointScorer } from '../../../domain/shared/types'

export interface ScorePointInput {
  matchId: string
  scorer: PointScorer
}
