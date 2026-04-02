import type { Gender } from '@scoreboard/core/domain/player.entity'
import { apiGet, apiPost } from './http'

export interface PlayerMeResponse {
  id: string
  name: string
  email: string
  gender: string
  whatsapp: string
  photoUrl: string
}

export interface CreatePlayerInput {
  name: string;
  gender: Gender | "";
}

export function getPlayerMe(token: string): Promise<PlayerMeResponse> {
  return apiGet<PlayerMeResponse>('/players/me', token)
}

export function createPlayer(token: string, player: CreatePlayerInput): Promise<PlayerMeResponse> {
  return apiPost<PlayerMeResponse>('/players', token, player)
}
