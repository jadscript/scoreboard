import type { IMatchRepository } from '@scoreboard/core/infrastructure/database/match-repository.interface'
import type { Match } from '@scoreboard/core/domain/match.aggregate'
import type { ScoreboardDatabase } from './database'
import { serializeMatch, deserializeMatch, type MatchDocument } from './match.serializer'

export class RxDBMatchRepository implements IMatchRepository {
  private readonly db: ScoreboardDatabase

  constructor(db: ScoreboardDatabase) {
    this.db = db
  }

  async findById(id: string): Promise<Match | null> {
    const doc = await this.db.matches.findOne(id).exec()
    if (!doc) return null
    // toJSON() returns DeepReadonlyObject<MatchDocument>; casting to MatchDocument
    // is safe because deserializeMatch only reads the object.
    return deserializeMatch(doc.toJSON() as MatchDocument)
  }

  async save(match: Match): Promise<void> {
    await this.db.matches.upsert(serializeMatch(match))
  }

  async hasActiveMatchForPlayer(playerId: string): Promise<boolean> {
    const docs = await this.db.matches
      .find({ selector: { status: { $ne: 'finished' } } })
      .exec()

    return docs.some((doc) => {
      const data = doc.toJSON()
      const allPlayers = [...(data.team1.players ?? []), ...(data.team2.players ?? [])]
      return allPlayers.some((p) => p.id === playerId)
    })
  }
}
