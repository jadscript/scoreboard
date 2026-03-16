import type { Match } from '../../domain/match.aggregate'

/**
 * Port (interface) for persisting and retrieving Match aggregates.
 * The concrete implementation lives in the infrastructure layer.
 */
export interface IMatchRepository {
  findById(id: string): Promise<Match | null>
  save(match: Match): Promise<void>
  /** Returns true if the player is associated with any match that is not finished. */
  hasActiveMatchForPlayer(playerId: string): Promise<boolean>
}
