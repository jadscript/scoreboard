import type { IQueryHandler } from '../../shared/query-handler.interface'
import type { IPlayerRepository } from '../../../infrastructure/database/player-repository.interface'
import type { PlayerDto } from '../../shared/match.dto'
import type { Player } from '../../../domain/player.entity'
import type { GetPlayerByUserIdInput } from './get-player-by-user-id.input'

export type GetPlayerByUserIdOutput = PlayerDto | null

export class GetPlayerByUserIdHandler
  implements IQueryHandler<GetPlayerByUserIdInput, GetPlayerByUserIdOutput>
{
  private readonly playerRepository: IPlayerRepository

  constructor(playerRepository: IPlayerRepository) {
    this.playerRepository = playerRepository
  }

  async execute(input: GetPlayerByUserIdInput): Promise<GetPlayerByUserIdOutput> {
    const player = await this.playerRepository.findByUserId(input.userId)
    if (!player) return null
    return toDto(player)
  }
}

function toDto(player: Player): PlayerDto {
  return {
    id: player.id,
    name: player.name,
    userId: player.userId,
    gender: player.gender,
    whatsapp: player.whatsapp,
    photoUrl: player.photoUrl,
  }
}
