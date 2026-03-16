import type { IMatchRepository } from '../../../infrastructure/database/match-repository.interface'
import type { Match } from '../../../domain/match.aggregate'

export class InMemoryMatchRepository implements IMatchRepository {
  private readonly store = new Map<string, Match>()

  async findById(id: string): Promise<Match | null> {
    return this.store.get(id) ?? null
  }

  async save(match: Match): Promise<void> {
    this.store.set(match.id, match)
  }

  async hasActiveMatchForPlayer(playerId: string): Promise<boolean> {
    for (const match of this.store.values()) {
      if (match.status === 'finished') continue
      const allPlayerIds = [
        ...match.team1.players.map((p) => p.id),
        ...match.team2.players.map((p) => p.id),
      ]
      if (allPlayerIds.includes(playerId)) return true
    }
    return false
  }

  get size(): number {
    return this.store.size
  }
}
