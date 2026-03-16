import type { ICommandHandler } from '../../shared/command-handler.interface'
import type { IMatchRepository } from '../../../infrastructure/database/match-repository.interface'
import type { StartMatchInput } from './start-match.input'

export class StartMatchHandler implements ICommandHandler<StartMatchInput> {
  private readonly matchRepository: IMatchRepository

  constructor(matchRepository: IMatchRepository) {
    this.matchRepository = matchRepository
  }

  async execute(input: StartMatchInput): Promise<void> {
    const match = await this.matchRepository.findById(input.matchId)
    if (!match) throw new Error(`Match not found: ${input.matchId}`)

    match.start()

    await this.matchRepository.save(match)
  }
}
