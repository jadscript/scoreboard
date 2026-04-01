import type { IPlayerRepository } from '../../../infrastructure/database/player-repository.interface'
import type { Player } from '../../../domain/player.entity'

export class InMemoryPlayerRepository implements IPlayerRepository {
  private readonly store = new Map<string, Player>()

  async findAll(): Promise<Player[]> {
    return Array.from(this.store.values())
  }

  async findById(id: string): Promise<Player | null> {
    return this.store.get(id) ?? null
  }

  async findByUserId(userId: string): Promise<Player | null> {
    for (const player of this.store.values()) {
      if (player.userId === userId) return player
    }
    return null
  }

  async findManyByIds(ids: string[]): Promise<Player[]> {
    return ids.flatMap((id) => {
      const p = this.store.get(id)
      return p ? [p] : []
    })
  }

  async save(player: Player): Promise<void> {
    this.store.set(player.id, player)
  }

  async deleteById(id: string): Promise<void> {
    this.store.delete(id)
  }
}
