import { Entity } from './shared/entity.base'
import type { GameType, PointScorer } from './shared/types'
import { Point } from './point.entity'

export type { GameType }

interface GameProps {
  type: GameType
  noAd: boolean
  points: Point[]
  winner: PointScorer | null
}

export class Game extends Entity<GameProps> {
  private constructor(props: GameProps, id?: string) {
    super(props, id)
  }

  static create(type: GameType = 'regular', noAd = false): Game {
    return new Game({ type, noAd, points: [], winner: null })
  }

  static restore(
    id: string,
    type: GameType,
    noAd: boolean,
    points: Point[],
    winner: PointScorer | null,
  ): Game {
    return new Game({ type, noAd, points, winner }, id)
  }

  get type(): GameType {
    return this.props.type
  }

  get noAd(): boolean {
    return this.props.noAd
  }

  get points(): ReadonlyArray<Point> {
    return [...this.props.points]
  }

  get winner(): PointScorer | null {
    return this.props.winner
  }

  get isFinished(): boolean {
    return this.props.winner !== null
  }

  get isTiebreak(): boolean {
    return this.props.type !== 'regular'
  }

  addPoint(scorer: PointScorer): void {
    if (this.isFinished) throw new Error('Cannot score a point in a finished game')
    this.props.points.push(Point.create(scorer))
    this.evaluateWinner()
  }

  /**
   * Returns the current display score for the game.
   * - Regular: '0', '15', '30', '40', 'Deuce', 'Advantage'
   * - Tiebreak / Super tiebreak: raw count ('0', '1', '2'...)
   */
  getScore(): { team1: string; team2: string } {
    const t1 = this.countPoints('team1')
    const t2 = this.countPoints('team2')

    if (this.isTiebreak) {
      return { team1: String(t1), team2: String(t2) }
    }

    const LABELS = ['0', '15', '30', '40'] as const

    if (t1 >= 3 && t2 >= 3) {
      if (this.noAd) return { team1: '40', team2: '40' }
      if (t1 === t2) return { team1: 'Deuce', team2: 'Deuce' }
      return t1 > t2
        ? { team1: 'Advantage', team2: '' }
        : { team1: '', team2: 'Advantage' }
    }

    return {
      team1: LABELS[Math.min(t1, 3)],
      team2: LABELS[Math.min(t2, 3)],
    }
  }

  private countPoints(scorer: PointScorer): number {
    return this.props.points.filter((p) => p.scorer === scorer).length
  }

  private evaluateWinner(): void {
    const t1 = this.countPoints('team1')
    const t2 = this.countPoints('team2')

    switch (this.props.type) {
      case 'super-tiebreak':
        // First to 10, win by 2
        if (t1 >= 10 && t1 - t2 >= 2) this.props.winner = 'team1'
        else if (t2 >= 10 && t2 - t1 >= 2) this.props.winner = 'team2'
        break

      case 'tiebreak':
        // First to 7, win by 2
        if (t1 >= 7 && t1 - t2 >= 2) this.props.winner = 'team1'
        else if (t2 >= 7 && t2 - t1 >= 2) this.props.winner = 'team2'
        break

      case 'regular':
      default:
        if (this.noAd) {
          // At deuce (3-3), next point wins (4-3)
          if (t1 >= 4 && t1 > t2) this.props.winner = 'team1'
          else if (t2 >= 4 && t2 > t1) this.props.winner = 'team2'
        } else {
          // Standard: minimum 4 points, win by 2 (covers deuce/advantage)
          if (t1 >= 4 && t1 - t2 >= 2) this.props.winner = 'team1'
          else if (t2 >= 4 && t2 - t1 >= 2) this.props.winner = 'team2'
        }
        break
    }
  }
}
