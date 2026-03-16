import type { ICommandHandler } from '../../shared/command-handler.interface'
import type { IPlayerRepository } from '../../../infrastructure/database/player-repository.interface'
import type { DeletePlayerInput } from './delete-player.input'

export class DeletePlayerHandler implements ICommandHandler<DeletePlayerInput> {
  private readonly playerRepository: IPlayerRepository

  constructor(playerRepository: IPlayerRepository) {
    this.playerRepository = playerRepository
  }

  async execute(input: DeletePlayerInput): Promise<void> {
    const existing = await this.playerRepository.findById(input.playerId)
    if (!existing) throw new Error(`Player not found: ${input.playerId}`)

    await this.playerRepository.deleteById(input.playerId)
  }
}
