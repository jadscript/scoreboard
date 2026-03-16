import { AggregateRoot } from './shared/aggregate-root.base'
import type { MatchStatus, MatchType, PointScorer } from './shared/types'
import { SetEntity } from './set.entity'
import { Team } from './value-objects/team.vo'
import { MatchConfig } from './value-objects/match-config.vo'
import { PointScoredEvent } from './events/point-scored.event'
import { GameWonEvent } from './events/game-won.event'
import { SetWonEvent } from './events/set-won.event'
import { MatchWonEvent } from './events/match-won.event'
import type { Player } from './player.entity'

interface MatchProps {
  team1: Team
  team2: Team
  config: MatchConfig
  sets: SetEntity[]
  winner: PointScorer | null
  status: MatchStatus
  matchType: MatchType | null
}

export class Match extends AggregateRoot<MatchProps> {
  private constructor(props: MatchProps, id?: string) {
    super(props, id)
  }

  static create(
    team1: Team,
    team2: Team,
    config: MatchConfig = MatchConfig.create(),
  ): Match {
    const matchType = Match.resolveMatchType(team1, team2)
    return new Match({
      team1,
      team2,
      config,
      sets: [],
      winner: null,
      status: 'not_started',
      matchType,
    })
  }

  static restore(
    id: string,
    team1: Team,
    team2: Team,
    config: MatchConfig,
    sets: SetEntity[],
    status: MatchStatus,
    winner: PointScorer | null,
    matchType: MatchType | null = null,
  ): Match {
    return new Match({ team1, team2, config, sets, winner, status, matchType }, id)
  }

  /**
   * Derives the match type from player count and genders.
   * Returns null when teams have no players.
   * Throws for mismatched team sizes or inconsistent gender compositions.
   */
  private static resolveMatchType(team1: Team, team2: Team): MatchType | null {
    const t1 = team1.players
    const t2 = team2.players

    if (t1.length === 0 && t2.length === 0) return null

    if (t1.length !== t2.length) {
      throw new Error('Both teams must have the same number of players')
    }

    if (t1.length === 1) return 'singles'

    if (t1.length === 2) {
      const allMale = (ps: ReadonlyArray<Player>) => ps.every((p) => p.gender === 'male')
      const allFemale = (ps: ReadonlyArray<Player>) => ps.every((p) => p.gender === 'female')
      const isMixed = (ps: ReadonlyArray<Player>) => !allMale(ps) && !allFemale(ps)

      if (allMale(t1) && allMale(t2)) return 'doubles_male'
      if (allFemale(t1) && allFemale(t2)) return 'doubles_female'
      if (isMixed(t1) && isMixed(t2)) return 'doubles_mixed'

      throw new Error('Inconsistent player genders between teams')
    }

    throw new Error('Teams must have 1 or 2 players')
  }

  get team1(): Team {
    return this.props.team1
  }

  get team2(): Team {
    return this.props.team2
  }

  get config(): MatchConfig {
    return this.props.config
  }

  get sets(): ReadonlyArray<SetEntity> {
    return [...this.props.sets]
  }

  get winner(): PointScorer | null {
    return this.props.winner
  }

  get status(): MatchStatus {
    return this.props.status
  }

  get matchType(): MatchType | null {
    return this.props.matchType
  }

  get isFinished(): boolean {
    return this.props.status === 'finished'
  }

  /** The currently active set, or null if the match has not started or is already finished */
  get currentSet(): SetEntity | null {
    const last = this.props.sets.at(-1) ?? null
    return last && !last.isFinished ? last : null
  }

  /** Starts the match and creates the first set */
  start(): void {
    if (this.props.status !== 'not_started') {
      throw new Error('The match has already started')
    }
    this.props.status = 'in_progress'
    this.props.sets.push(this.createNextSet())
  }

  /**
   * Records a point for the given scorer.
   * Fires domain events for each relevant transition:
   * PointScored → (GameWon → (SetWon → MatchWon?))
   */
  scorePoint(scorer: PointScorer): void {
    if (this.props.status !== 'in_progress') {
      throw new Error('The match is not in progress')
    }

    const set = this.currentSet
    if (!set) throw new Error('No active set')

    const game = set.currentGame
    if (!game) throw new Error('No active game')

    set.scorePoint(scorer)

    this.addDomainEvent(new PointScoredEvent(this.id, scorer, set.id, game.id))

    if (game.isFinished) {
      this.addDomainEvent(new GameWonEvent(this.id, game.winner!, set.id, game.id))

      if (set.isFinished) {
        this.addDomainEvent(new SetWonEvent(this.id, set.winner!, set.id))
        this.evaluateMatchWinner()

        if (this.isFinished) {
          this.addDomainEvent(new MatchWonEvent(this.id, this.props.winner!))
        } else {
          this.props.sets.push(this.createNextSet())
        }
      }
    }
  }

  /** Match score in sets won */
  getSetScore(): { team1: number; team2: number } {
    const finished = this.props.sets.filter((s) => s.isFinished)
    return {
      team1: finished.filter((s) => s.winner === 'team1').length,
      team2: finished.filter((s) => s.winner === 'team2').length,
    }
  }

  private evaluateMatchWinner(): void {
    const { team1, team2 } = this.getSetScore()

    if (team1 >= this.props.config.setsToWin) {
      this.props.winner = 'team1'
      this.props.status = 'finished'
    } else if (team2 >= this.props.config.setsToWin) {
      this.props.winner = 'team2'
      this.props.status = 'finished'
    }
  }

  private createNextSet(): SetEntity {
    const { team1, team2 } = this.getSetScore()
    const nextSetNumber = team1 + team2 + 1
    const isDecidingSet = nextSetNumber === this.props.config.bestOf

    // Super tiebreak for the deciding set (except in best-of-1, which is a normal set)
    const isSuperTiebreak =
      this.props.config.finalSetSuperTiebreak &&
      isDecidingSet &&
      this.props.config.bestOf > 1

    return SetEntity.create({
      noAd: this.props.config.noAd,
      isSuperTiebreak,
    })
  }
}
