import type { ICommandHandler } from '../../shared/command-handler.interface'
import type { IMatchRepository } from '../../../infrastructure/database/match-repository.interface'
import type { ScorePointInput } from './score-point.input'
import type { ScorePointOutput } from './score-point.output'

export class ScorePointHandler
  implements ICommandHandler<ScorePointInput, ScorePointOutput>
{
  private readonly matchRepository: IMatchRepository

  constructor(matchRepository: IMatchRepository) {
    this.matchRepository = matchRepository
  }

  async execute(input: ScorePointInput): Promise<ScorePointOutput> {
    const match = await this.matchRepository.findById(input.matchId)
    if (!match) throw new Error(`Match not found: ${input.matchId}`)

    match.scorePoint(input.scorer)

    const events = match.pullDomainEvents()

    await this.matchRepository.save(match)

    return { eventNames: events.map((e) => e.eventName) }
  }
}
