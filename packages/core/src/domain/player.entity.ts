import { Entity } from './shared/entity.base'
import type { Gender } from './shared/types'

export type { Gender }

interface PlayerProps {
  name: string
  userId: string
  gender: Gender
  whatsapp: string | null
  photoUrl: string | null
}

export class Player extends Entity<PlayerProps> {
  private constructor(props: PlayerProps, id?: string) {
    super(props, id)
  }

  static create(
    name: string,
    userId: string,
    gender: Gender,
    whatsapp: string | null = null,
    photoUrl: string | null = null,
  ): Player {
    return new Player({ name, userId, gender, whatsapp, photoUrl })
  }

  static restore(
    id: string,
    name: string,
    userId: string,
    gender: Gender,
    whatsapp: string | null,
    photoUrl: string | null,
  ): Player {
    return new Player({ name, userId, gender, whatsapp, photoUrl }, id)
  }

  get name(): string {
    return this.props.name
  }

  get userId(): string {
    return this.props.userId
  }

  get gender(): Gender {
    return this.props.gender
  }

  get whatsapp(): string | null {
    return this.props.whatsapp
  }

  get photoUrl(): string | null {
    return this.props.photoUrl
  }
}
