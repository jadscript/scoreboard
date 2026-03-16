import type { DomainEvent } from '../shared/domain-event.interface'
import type { PointScorer } from '../shared/types'

interface SetWonEventProps {
  matchId: string
  winner: PointScorer
  setId: string
}

export class SetWonEvent implements DomainEvent {
  readonly eventName = 'SetWon'
  readonly occurredAt = new Date()

  private readonly props: SetWonEventProps

  constructor(matchId: string, winner: PointScorer, setId: string) {
    this.props = { matchId, winner, setId }
  }

  get matchId(): string { return this.props.matchId }
  get winner(): PointScorer { return this.props.winner }
  get setId(): string { return this.props.setId }
}
