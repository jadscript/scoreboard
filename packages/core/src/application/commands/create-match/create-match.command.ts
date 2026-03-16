import type { ICommandHandler } from '../../shared/command-handler.interface'
import type { IMatchRepository } from '../../../infrastructure/database/match-repository.interface'
import type { IPlayerRepository } from '../../../infrastructure/database/player-repository.interface'
import type { CreateMatchInput } from './create-match.input'
import type { CreateMatchOutput } from './create-match.output'
import { Match } from '../../../domain/match.aggregate'
import { Team } from '../../../domain/value-objects/team.vo'
import { MatchConfig } from '../../../domain/value-objects/match-config.vo'
import type { Player } from '../../../domain/player.entity'

export class CreateMatchHandler
  implements ICommandHandler<CreateMatchInput, CreateMatchOutput>
{
  private readonly matchRepository: IMatchRepository
  private readonly playerRepository: IPlayerRepository

  constructor(matchRepository: IMatchRepository, playerRepository: IPlayerRepository) {
    this.matchRepository = matchRepository
    this.playerRepository = playerRepository
  }

  async execute(input: CreateMatchInput): Promise<CreateMatchOutput> {
    const team1PlayerIds = input.team1PlayerIds ?? []
    const team2PlayerIds = input.team2PlayerIds ?? []
    const hasPlayers = team1PlayerIds.length > 0 || team2PlayerIds.length > 0

    let team1Players: Player[] = []
    let team2Players: Player[] = []

    if (hasPlayers) {
      team1Players = await this.playerRepository.findManyByIds(team1PlayerIds)
      team2Players = await this.playerRepository.findManyByIds(team2PlayerIds)

      if (team1Players.length !== team1PlayerIds.length) {
        throw new Error('One or more players from team 1 were not found')
      }
      if (team2Players.length !== team2PlayerIds.length) {
        throw new Error('One or more players from team 2 were not found')
      }

      // Rule 1: no player may be in an active match
      for (const player of [...team1Players, ...team2Players]) {
        const isActive = await this.matchRepository.hasActiveMatchForPlayer(player.id)
        if (isActive) {
          throw new Error(`Player ${player.id} is already in an active match`)
        }
      }
    }

    const team1 = Team.create(input.team1Name, team1Players)
    const team2 = Team.create(input.team2Name, team2Players)
    const config = MatchConfig.create(input.config)

    // Rules 2 & 3 are enforced inside Match.create (domain invariants)
    const match = Match.create(team1, team2, config)

    await this.matchRepository.save(match)

    return { matchId: match.id }
  }
}
