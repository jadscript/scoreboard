import axios from 'axios'
import type { AxiosError } from 'axios'
import { env } from '../infrastructure/env'

function isAxiosError(err: unknown): err is AxiosError {
  return axios.isAxiosError(err)
}

const apiClient = axios.create({
  baseURL: env.VITE_API_URL.replace(/\/$/, ''),
})

export async function apiGet<T>(path: string, token: string): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  try {
    const { data } = await apiClient.get<T>(normalizedPath, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return data
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      const status = err.response?.status ?? 0
      const payload = err.response?.data
      const body =
        typeof payload === 'string'
          ? payload
          : payload != null
            ? JSON.stringify(payload)
            : ''
      throw new Error(body || `HTTP ${status} ${err.message}`)
    }
    throw err
  }
}
