import type { IQueryHandler } from '../../shared/query-handler.interface'
import type { IPlayerRepository } from '../../../infrastructure/database/player-repository.interface'
import type { PlayerDto } from '../../shared/match.dto'
import type { Player } from '../../../domain/player.entity'

export type GetAllPlayersOutput = PlayerDto[]

export class GetAllPlayersHandler implements IQueryHandler<void, GetAllPlayersOutput> {
  private readonly playerRepository: IPlayerRepository

  constructor(playerRepository: IPlayerRepository) {
    this.playerRepository = playerRepository
  }

  async execute(): Promise<GetAllPlayersOutput> {
    const players = await this.playerRepository.findAll()
    return players.map(toDto)
  }
}

function toDto(player: Player): PlayerDto {
  return {
    id: player.id,
    name: player.name,
    email: player.email,
    gender: player.gender,
    whatsapp: player.whatsapp,
    photoUrl: player.photoUrl,
  }
}
