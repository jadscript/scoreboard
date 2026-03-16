import { Entity } from './shared/entity.base'
import type { Gender } from './shared/types'

export type { Gender }

interface PlayerProps {
  name: string
  email: string
  gender: Gender
  whatsapp: string
  photoUrl: string | null
}

export class Player extends Entity<PlayerProps> {
  private constructor(props: PlayerProps, id?: string) {
    super(props, id)
  }

  static create(
    name: string,
    email: string,
    gender: Gender,
    whatsapp: string,
    photoUrl: string | null = null,
  ): Player {
    return new Player({ name, email, gender, whatsapp, photoUrl })
  }

  static restore(
    id: string,
    name: string,
    email: string,
    gender: Gender,
    whatsapp: string,
    photoUrl: string | null,
  ): Player {
    return new Player({ name, email, gender, whatsapp, photoUrl }, id)
  }

  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  get gender(): Gender {
    return this.props.gender
  }

  get whatsapp(): string {
    return this.props.whatsapp
  }

  get photoUrl(): string | null {
    return this.props.photoUrl
  }
}
