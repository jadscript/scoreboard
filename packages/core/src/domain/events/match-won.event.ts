import type { DomainEvent } from '../shared/domain-event.interface'
import type { PointScorer } from '../shared/types'

interface MatchWonEventProps {
  matchId: string
  winner: PointScorer
}

export class MatchWonEvent implements DomainEvent {
  readonly eventName = 'MatchWon'
  readonly occurredAt = new Date()

  private readonly props: MatchWonEventProps

  constructor(matchId: string, winner: PointScorer) {
    this.props = { matchId, winner }
  }

  get matchId(): string { return this.props.matchId }
  get winner(): PointScorer { return this.props.winner }
}
