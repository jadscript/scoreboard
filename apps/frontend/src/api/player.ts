import { apiGet } from './http'

export interface PlayerMeResponse {
  id: string
  name: string
  email: string
  gender: string
  whatsapp: string
  photoUrl: string
}

export function getPlayerMe(token: string): Promise<PlayerMeResponse> {
  return apiGet<PlayerMeResponse>('/players/me', token)
}
