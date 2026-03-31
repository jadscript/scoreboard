import type { Gender } from '../../../domain/player.entity'

export interface CreatePlayerInput {
  name: string
  userId: string
  gender: Gender
  whatsapp: string
  photoUrl?: string | null
}
