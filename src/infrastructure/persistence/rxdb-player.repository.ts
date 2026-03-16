import type { IPlayerRepository } from '../../core/infrastructure/database/player-repository.interface'
import type { ScoreboardDatabase } from './database'
import { Player } from '../../core/domain/player.entity'
import type { PlayerDocument } from './player.schema'

export class RxDBPlayerRepository implements IPlayerRepository {
  private readonly db: ScoreboardDatabase

  constructor(db: ScoreboardDatabase) {
    this.db = db
  }

  async findAll(): Promise<Player[]> {
    const docs = await this.db.players.find().exec()
    return docs.map((doc) => toPlayer(doc.toJSON() as PlayerDocument))
  }

  async findById(id: string): Promise<Player | null> {
    const doc = await this.db.players.findOne(id).exec()
    if (!doc) return null
    return toPlayer(doc.toJSON() as PlayerDocument)
  }

  async findManyByIds(ids: string[]): Promise<Player[]> {
    const docs = await this.db.players
      .find({ selector: { id: { $in: ids } } })
      .exec()
    return docs.map((doc) => toPlayer(doc.toJSON() as PlayerDocument))
  }

  async save(player: Player): Promise<void> {
    await this.db.players.upsert({
      id: player.id,
      name: player.name,
      email: player.email,
      gender: player.gender,
      whatsapp: player.whatsapp,
      photoUrl: player.photoUrl,
    })
  }

  async deleteById(id: string): Promise<void> {
    const doc = await this.db.players.findOne(id).exec()
    await doc?.remove()
  }
}

function toPlayer(doc: PlayerDocument): Player {
  return Player.restore(doc.id, doc.name, doc.email, doc.gender, doc.whatsapp, doc.photoUrl)
}
