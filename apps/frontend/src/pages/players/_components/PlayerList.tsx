import type { PlayerDto } from '../usePlayers'
import { GenderBadge } from './GenderBadge'

interface Props {
  players: PlayerDto[]
  onEdit: (player: PlayerDto) => void
  onDelete: (player: PlayerDto) => void
  onCreateFirst: () => void
}

function initial(name: string) {
  return name.charAt(0).toUpperCase()
}

export function PlayerList({ players, onEdit, onDelete, onCreateFirst }: Props) {
  if (players.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center justify-center py-16 gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-slate-500 text-sm">Nenhum player cadastrado</p>
        <button
          onClick={onCreateFirst}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
        >
          Criar o primeiro
        </button>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
      <ul className="divide-y divide-slate-700">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center gap-4 px-5 py-4 hover:bg-slate-700/40 transition-colors"
          >
            {player.photoUrl ? (
              <img
                src={player.photoUrl}
                alt={player.name}
                className="h-10 w-10 rounded-full object-cover shrink-0 bg-slate-700"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <span className="text-indigo-300 font-semibold text-sm">
                  {initial(player.name)}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-slate-100 text-sm font-medium truncate">{player.name}</p>
              <p className="text-slate-500 text-xs mt-0.5 truncate">{player.userId}</p>
            </div>

            <GenderBadge gender={player.gender} />

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(player)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(player)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Excluir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
