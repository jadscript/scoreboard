import type { Gender } from '../../../domain/player.entity'

export interface UpdatePlayerInput {
  playerId: string
  name: string
  email: string
  gender: Gender
  whatsapp: string
  photoUrl?: string | null
}
