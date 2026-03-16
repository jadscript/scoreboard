import type { Player } from '../player.entity'

interface TeamProps {
  id: string
  name: string
  players: Player[]
}

export class Team {
  private readonly props: TeamProps

  private constructor(props: TeamProps) {
    this.props = props
  }

  static create(name: string, players: Player[] = []): Team {
    return new Team({ id: crypto.randomUUID(), name, players })
  }

  static restore(id: string, name: string, players: Player[] = []): Team {
    return new Team({ id, name, players })
  }

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get players(): ReadonlyArray<Player> {
    return [...this.props.players]
  }

  equals(other: Team): boolean {
    return this.props.id === other.props.id
  }
}
