import { Trash2, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { GameUser } from '../useGameUsers'
import { GameConfigCard } from './GameConfigCard'

interface GameUsersSectionProps {
  users: GameUser[]
  onAdd: (name: string) => boolean
  onRemove: (id: string) => void
}

export function GameUsersSection({ users, onAdd, onRemove }: GameUsersSectionProps) {
  const [draft, setDraft] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (onAdd(draft)) setDraft('')
  }

  return (
    <GameConfigCard
      title="Jogadores salvos"
      subtitle="Cadastre nomes no navegador para escolher nos times (ou digite à mão)"
      icon={<UserPlus className="h-5 w-5" aria-hidden />}
      defaultOpen={false}
    >
      <div className="flex flex-col gap-4 pt-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1">
              <span className="mb-1 block font-bold tracking-wide ">
                Novo jogador
              </span>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Nome"
                maxLength={80}
                className="w-full rounded-xl bg-green-100/40 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
            </label>
            <button
              type="submit"
              className="cursor-pointer shrink-0 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
            >
              Adicionar
            </button>
          </form>

          {users.length > 0 ? (
            <ul className="rounded-xl bg-green-100/40">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm first:rounded-t-xl last:rounded-b-xl"
                >
                  <span className="min-w-0 truncate font-medium">{u.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(u.id)}
                    className="cursor-pointer shrink-0 rounded-lg p-1.5 text-red-700/70 transition hover:bg-red-100 hover:text-red-700"
                    aria-label={`Remover ${u.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Nenhum jogador salvo ainda.</p>
          )}
      </div>
    </GameConfigCard>
  )
}
