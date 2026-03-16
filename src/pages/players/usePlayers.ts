import { useState, useEffect, useCallback, useRef } from 'react'
import type { Gender } from '../../core/domain/player.entity'
import type { PlayerDto } from '../../core/application/shared/match.dto'
import { CreatePlayerHandler } from '../../core/application/commands/create-player/create-player.command'
import { UpdatePlayerHandler } from '../../core/application/commands/update-player/update-player.command'
import { DeletePlayerHandler } from '../../core/application/commands/delete-player/delete-player.command'
import { GetAllPlayersHandler } from '../../core/application/queries/get-all-players/get-all-players.query'
import { RxDBPlayerRepository } from '../../infrastructure/persistence/rxdb-player.repository'
import { getDatabase } from '../../infrastructure/persistence/database'

export type { PlayerDto }

export interface PlayerFormData {
  name: string
  email: string
  gender: Gender
  whatsapp: string
  photoUrl: string
}

interface Handlers {
  createPlayer: CreatePlayerHandler
  updatePlayer: UpdatePlayerHandler
  deletePlayer: DeletePlayerHandler
  getAll: GetAllPlayersHandler
}

export function usePlayers() {
  const [players, setPlayers] = useState<PlayerDto[]>([])
  const [loading, setLoading] = useState(true)
  const handlers = useRef<Handlers | null>(null)

  useEffect(() => {
    let cancelled = false

    getDatabase().then(async (db) => {
      if (cancelled) return

      const repo = new RxDBPlayerRepository(db)
      handlers.current = {
        createPlayer: new CreatePlayerHandler(repo),
        updatePlayer: new UpdatePlayerHandler(repo),
        deletePlayer: new DeletePlayerHandler(repo),
        getAll: new GetAllPlayersHandler(repo),
      }

      const all = await handlers.current.getAll.execute()
      if (cancelled) return

      setPlayers(all)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  const create = useCallback(async (form: PlayerFormData) => {
    if (!handlers.current) return
    const { playerId } = await handlers.current.createPlayer.execute({
      name: form.name,
      email: form.email,
      gender: form.gender,
      whatsapp: form.whatsapp,
      photoUrl: form.photoUrl || null,
    })
    const newPlayer: PlayerDto = {
      id: playerId,
      name: form.name,
      email: form.email,
      gender: form.gender,
      whatsapp: form.whatsapp,
      photoUrl: form.photoUrl || null,
    }
    setPlayers((prev) => [...prev, newPlayer])
  }, [])

  const update = useCallback(async (playerId: string, form: PlayerFormData) => {
    if (!handlers.current) return
    await handlers.current.updatePlayer.execute({
      playerId,
      name: form.name,
      email: form.email,
      gender: form.gender,
      whatsapp: form.whatsapp,
      photoUrl: form.photoUrl || null,
    })
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, name: form.name, email: form.email, gender: form.gender, whatsapp: form.whatsapp, photoUrl: form.photoUrl || null }
          : p,
      ),
    )
  }, [])

  const remove = useCallback(async (playerId: string) => {
    if (!handlers.current) return
    await handlers.current.deletePlayer.execute({ playerId })
    setPlayers((prev) => prev.filter((p) => p.id !== playerId))
  }, [])

  return { players, loading, create, update, remove }
}
