import type { DomainEvent } from '../shared/domain-event.interface'
import type { PointScorer } from '../shared/types'

interface GameWonEventProps {
  matchId: string
  winner: PointScorer
  setId: string
  gameId: string
}

export class GameWonEvent implements DomainEvent {
  readonly eventName = 'GameWon'
  readonly occurredAt = new Date()

  private readonly props: GameWonEventProps

  constructor(matchId: string, winner: PointScorer, setId: string, gameId: string) {
    this.props = { matchId, winner, setId, gameId }
  }

  get matchId(): string { return this.props.matchId }
  get winner(): PointScorer { return this.props.winner }
  get setId(): string { return this.props.setId }
  get gameId(): string { return this.props.gameId }
}
