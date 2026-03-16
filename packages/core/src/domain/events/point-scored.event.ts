import type { DomainEvent } from '../shared/domain-event.interface'
import type { PointScorer } from '../shared/types'

interface PointScoredEventProps {
  matchId: string
  scorer: PointScorer
  setId: string
  gameId: string
}

export class PointScoredEvent implements DomainEvent {
  readonly eventName = 'PointScored'
  readonly occurredAt = new Date()

  private readonly props: PointScoredEventProps

  constructor(matchId: string, scorer: PointScorer, setId: string, gameId: string) {
    this.props = { matchId, scorer, setId, gameId }
  }

  get matchId(): string { return this.props.matchId }
  get scorer(): PointScorer { return this.props.scorer }
  get setId(): string { return this.props.setId }
  get gameId(): string { return this.props.gameId }
}
