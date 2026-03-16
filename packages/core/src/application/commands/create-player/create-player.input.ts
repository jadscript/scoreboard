import type { Gender } from '../../../domain/player.entity'

export interface CreatePlayerInput {
  name: string
  email: string
  gender: Gender
  whatsapp: string
  photoUrl?: string | null
}
