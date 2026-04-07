import type { Gender } from '@scoreboard/core/domain/player.entity'
import { apiGet, apiPost } from './http'

export interface PlayerMeResponse {
  id: string
  name: string
  userId: string
  gender: string
  whatsapp: string
  photoUrl: string
}

export interface CreatePlayerInput {
  name: string;
  gender: Gender | "";
}

export function getPlayerMe(token: string): Promise<PlayerMeResponse | null> {
  return apiGet<PlayerMeResponse | null>('/players/me', token)
}

export function createPlayer(token: string, player: CreatePlayerInput): Promise<PlayerMeResponse> {
  return apiPost<PlayerMeResponse>('/players', token, player)
}

export function getPlayerByUserId(token: string, userId: string): Promise<PlayerMeResponse> {
  return apiGet<PlayerMeResponse>(
    `/players/by-user-id/${encodeURIComponent(userId)}`,
    token,
  )
}
