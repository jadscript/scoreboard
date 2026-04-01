import type { Gender } from '../../../domain/player.entity'

export interface UpdatePlayerInput {
  playerId: string
  name: string
  gender: Gender
  whatsapp?: string | null
  photoUrl?: string | null
}
