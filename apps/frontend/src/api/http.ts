import axios from 'axios'
import type { AxiosError } from 'axios'
import { env } from '../infrastructure/env'

function isAxiosError(err: unknown): err is AxiosError {
  return axios.isAxiosError(err)
}

export class ApiHttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
  }
}

const apiClient = axios.create({
  baseURL: env.VITE_API_URL.replace(/\/$/, ''),
})

type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface ApiRequestOptions<T = unknown> {
  method: ApiMethod;
  path: string;
  token: string;
  data?: T;
  params?: Record<string, unknown>;
}

async function apiRequest<R = unknown, D = unknown>({
  method,
  path,
  token,
  data,
  params,
}: ApiRequestOptions<D>): Promise<R> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  try {
    const { data: responseData } = await apiClient.request<R>({
      url: normalizedPath,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      ...(data !== undefined ? { data } : {}),
      ...(params !== undefined ? { params } : {}),
    });
    return responseData;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      const payload = err.response?.data;
      const body =
        typeof payload === 'string'
          ? payload
          : payload != null
          ? JSON.stringify(payload)
          : '';
      throw new ApiHttpError(body || err.message || 'Request failed', status);
    }
    throw err;
  }
}

export function apiGet<T>(path: string, token: string): Promise<T> {
  return apiRequest<T>({
    method: 'get',
    path,
    token,
  });
}

export function apiPost<T>(path: string, token: string, data?: unknown): Promise<T> {
  return apiRequest<T, typeof data>({
    method: 'post',
    path,
    token,
    data,
  });
}

export function apiPut<T>(path: string, token: string, data?: unknown): Promise<T> {
  return apiRequest<T, typeof data>({
    method: 'put',
    path,
    token,
    data,
  });
}

export function apiPatch<T>(path: string, token: string, data?: unknown): Promise<T> {
  return apiRequest<T, typeof data>({
    method: 'patch',
    path,
    token,
    data,
  });
}

export function apiDelete<T>(path: string, token: string): Promise<T> {
  return apiRequest<T>({
    method: 'delete',
    path,
    token,
  });
}