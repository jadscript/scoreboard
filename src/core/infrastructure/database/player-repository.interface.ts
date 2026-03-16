import type { Player } from '../../domain/player.entity'

export interface IPlayerRepository {
  findAll(): Promise<Player[]>
  findById(id: string): Promise<Player | null>
  findManyByIds(ids: string[]): Promise<Player[]>
  save(player: Player): Promise<void>
  deleteById(id: string): Promise<void>
}
