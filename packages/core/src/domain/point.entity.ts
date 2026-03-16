import { Entity } from './shared/entity.base'
import type { PointScorer } from './shared/types'

export type { PointScorer }

interface PointProps {
  scorer: PointScorer
  scoredAt: Date
}

export class Point extends Entity<PointProps> {
  private constructor(props: PointProps, id?: string) {
    super(props, id)
  }

  static create(scorer: PointScorer): Point {
    return new Point({ scorer, scoredAt: new Date() })
  }

  static restore(id: string, scorer: PointScorer, scoredAt: Date): Point {
    return new Point({ scorer, scoredAt }, id)
  }

  get scorer(): PointScorer {
    return this.props.scorer
  }

  get scoredAt(): Date {
    return this.props.scoredAt
  }
}
