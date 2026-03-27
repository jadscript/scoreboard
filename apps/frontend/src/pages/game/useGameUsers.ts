import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'scoreboard/game-users'
const PERSIST_VERSION = 1

export interface GameUser {
  id: string
  name: string
}

interface Persisted {
  v: number
  users: GameUser[]
}

function readFromStorage(): GameUser[] {
  if (typeof globalThis.localStorage === 'undefined') return []
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY)
    if (raw === null || raw === '') return []
    const data = JSON.parse(raw) as unknown
    if (typeof data !== 'object' || data === null) return []
    const o = data as Record<string, unknown>
    if (o.v !== PERSIST_VERSION) return []
    if (!Array.isArray(o.users)) return []
    const users: GameUser[] = []
    for (const item of o.users) {
      if (typeof item !== 'object' || item === null) continue
      const u = item as Record<string, unknown>
      if (typeof u.id !== 'string' || typeof u.name !== 'string') continue
      const name = u.name.trim().slice(0, 80)
      if (name.length === 0) continue
      users.push({ id: u.id, name })
    }
    return users
  } catch {
    return []
  }
}

function writeToStorage(users: GameUser[]): void {
  if (typeof globalThis.localStorage === 'undefined') return
  try {
    const body: Persisted = { v: PERSIST_VERSION, users }
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(body))
  } catch {
    /* quota */
  }
}

function normalizeName(name: string): string {
  return name.trim().slice(0, 80)
}

export function useGameUsers() {
  const [users, setUsers] = useState<GameUser[]>(readFromStorage)

  useEffect(() => {
    writeToStorage(users)
  }, [users])

  const addUser = useCallback((rawName: string) => {
    const name = normalizeName(rawName)
    if (name.length === 0) return false
    const lower = name.toLowerCase()
    setUsers((prev) => {
      if (prev.some((u) => u.name.toLowerCase() === lower)) return prev
      return [...prev, { id: crypto.randomUUID(), name }]
    })
    return true
  }, [])

  const removeUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  return { users, addUser, removeUser }
}
