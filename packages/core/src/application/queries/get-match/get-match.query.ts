import type { IQueryHandler } from '../../shared/query-handler.interface'
import type { IMatchRepository } from '../../../infrastructure/database/match-repository.interface'
import type { MatchDto, SetDto, GameDto, TeamDto } from '../../shared/match.dto'
import type { Team } from '../../../domain/value-objects/team.vo'
import type { GetMatchInput } from './get-match.input'
import type { Match } from '../../../domain/match.aggregate'
import type { SetEntity } from '../../../domain/set.entity'
import type { Game } from '../../../domain/game.entity'

export class GetMatchHandler implements IQueryHandler<GetMatchInput, MatchDto> {
  private readonly matchRepository: IMatchRepository

  constructor(matchRepository: IMatchRepository) {
    this.matchRepository = matchRepository
  }

  async execute(input: GetMatchInput): Promise<MatchDto> {
    const match = await this.matchRepository.findById(input.matchId)
    if (!match) throw new Error(`Match not found: ${input.matchId}`)

    return this.toMatchDto(match)
  }

  private toMatchDto(match: Match): MatchDto {
    const setScore = match.getSetScore()
    const sets = match.sets.map((s) => this.toSetDto(s))
    const currentSet = match.currentSet ? this.toSetDto(match.currentSet) : null

    return {
      id: match.id,
      team1: this.toTeamDto(match.team1),
      team2: this.toTeamDto(match.team2),
      matchType: match.matchType,
      status: match.status,
      winner: match.winner,
      setScore,
      currentSet,
      sets,
    }
  }

  private toTeamDto(team: Team): TeamDto {
    return {
      id: team.id,
      name: team.name,
      players: team.players.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        gender: p.gender,
        whatsapp: p.whatsapp,
        photoUrl: p.photoUrl,
      })),
    }
  }

  private toSetDto(set: SetEntity): SetDto {
    const games = set.games.map((g) => this.toGameDto(g))
    const currentGame = set.currentGame ? this.toGameDto(set.currentGame) : null

    return {
      id: set.id,
      score: set.getScore(),
      winner: set.winner,
      isFinished: set.isFinished,
      isSuperTiebreak: set.isSuperTiebreak,
      currentGame,
      games,
    }
  }

  private toGameDto(game: Game): GameDto {
    return {
      id: game.id,
      type: game.type,
      score: game.getScore(),
      winner: game.winner,
      isFinished: game.isFinished,
    }
  }
}
