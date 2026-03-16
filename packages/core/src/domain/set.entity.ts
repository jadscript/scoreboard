import { Entity } from './shared/entity.base'
import type { PointScorer } from './shared/types'
import { Game } from './game.entity'

export interface SetConfig {
  noAd: boolean
  /**
   * When true, the entire set is played as a super tiebreak
   * (a single game to 10 points, win by 2).
   * Typically used for the deciding set in beach tennis matches.
   */
  isSuperTiebreak: boolean
}

interface SetProps {
  config: SetConfig
  games: Game[]
  winner: PointScorer | null
}

export class SetEntity extends Entity<SetProps> {
  private constructor(props: SetProps, id?: string) {
    super(props, id)
  }

  static create(config: Partial<SetConfig> = {}): SetEntity {
    const fullConfig: SetConfig = {
      noAd: config.noAd ?? false,
      isSuperTiebreak: config.isSuperTiebreak ?? false,
    }
    const set = new SetEntity({ config: fullConfig, games: [], winner: null })
    set.props.games.push(set.createNextGame())
    return set
  }

  static restore(
    id: string,
    config: SetConfig,
    games: Game[],
    winner: PointScorer | null,
  ): SetEntity {
    return new SetEntity({ config, games, winner }, id)
  }

  /** All games in the set, including the one currently in progress */
  get games(): ReadonlyArray<Game> {
    return [...this.props.games]
  }

  /** The currently active game, or null if the set is finished */
  get currentGame(): Game | null {
    const last = this.props.games.at(-1) ?? null
    return last && !last.isFinished ? last : null
  }

  get winner(): PointScorer | null {
    return this.props.winner
  }

  get isFinished(): boolean {
    return this.props.winner !== null
  }

  get noAd(): boolean {
    return this.props.config.noAd
  }

  get isSuperTiebreak(): boolean {
    return this.props.config.isSuperTiebreak
  }

  scorePoint(scorer: PointScorer): void {
    if (this.isFinished) throw new Error('Cannot score a point in a finished set')

    const game = this.currentGame
    if (!game) throw new Error('No active game in the set')

    game.addPoint(scorer)

    if (game.isFinished) {
      this.evaluateWinner()
      if (!this.isFinished) {
        this.props.games.push(this.createNextGame())
      }
    }
  }

  /**
   * Current set score in number of games won.
   * Only counts finished games.
   */
  getScore(): { team1: number; team2: number } {
    const finished = this.props.games.filter((g) => g.isFinished)
    return {
      team1: finished.filter((g) => g.winner === 'team1').length,
      team2: finished.filter((g) => g.winner === 'team2').length,
    }
  }

  private createNextGame(): Game {
    if (this.props.config.isSuperTiebreak) {
      return Game.create('super-tiebreak', false)
    }

    const { team1, team2 } = this.getScore()
    const isTiebreak = team1 === 6 && team2 === 6
    return Game.create(isTiebreak ? 'tiebreak' : 'regular', this.props.config.noAd)
  }

  private evaluateWinner(): void {
    if (this.props.config.isSuperTiebreak) {
      // A single game decides the set
      const winner = this.props.games[0]?.winner
      if (winner) this.props.winner = winner
      return
    }

    const { team1, team2 } = this.getScore()

    // First to 6 games, win by 2 (covers 6-0 through 6-4 and 7-5)
    if (team1 >= 6 && team1 - team2 >= 2) {
      this.props.winner = 'team1'
    } else if (team2 >= 6 && team2 - team1 >= 2) {
      this.props.winner = 'team2'
    }
    // Tiebreak: final score 7-6
    else if (team1 === 7 && team2 === 6) {
      this.props.winner = 'team1'
    } else if (team2 === 7 && team1 === 6) {
      this.props.winner = 'team2'
    }
  }
}
