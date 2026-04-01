import type { ICommandHandler } from '../../shared/command-handler.interface'
import type { IPlayerRepository } from '../../../infrastructure/database/player-repository.interface'
import type { UpdatePlayerInput } from './update-player.input'
import { Player } from '../../../domain/player.entity'

export class UpdatePlayerHandler implements ICommandHandler<UpdatePlayerInput> {
  private readonly playerRepository: IPlayerRepository

  constructor(playerRepository: IPlayerRepository) {
    this.playerRepository = playerRepository
  }

  async execute(input: UpdatePlayerInput): Promise<void> {
    const existing = await this.playerRepository.findById(input.playerId)
    if (!existing) throw new Error(`Player not found: ${input.playerId}`)

    const whatsapp =
      input.whatsapp !== undefined ? input.whatsapp : existing.whatsapp
    const photoUrl =
      input.photoUrl !== undefined ? input.photoUrl : existing.photoUrl

    const updated = Player.restore(
      input.playerId,
      input.name,
      existing.userId,
      input.gender,
      whatsapp,
      photoUrl,
    )

    await this.playerRepository.save(updated)
  }
}
