import type { ICommandHandler } from '../../shared/command-handler.interface'
import type { IPlayerRepository } from '../../../infrastructure/database/player-repository.interface'
import type { CreatePlayerInput } from './create-player.input'
import type { CreatePlayerOutput } from './create-player.output'
import { Player } from '../../../domain/player.entity'

export class CreatePlayerHandler
  implements ICommandHandler<CreatePlayerInput, CreatePlayerOutput>
{
  private readonly playerRepository: IPlayerRepository

  constructor(playerRepository: IPlayerRepository) {
    this.playerRepository = playerRepository
  }

  async execute(input: CreatePlayerInput): Promise<CreatePlayerOutput> {
    const player = Player.create(
      input.name,
      input.email,
      input.gender,
      input.whatsapp,
      input.photoUrl ?? null,
    )

    await this.playerRepository.save(player)

    return { playerId: player.id }
  }
}
