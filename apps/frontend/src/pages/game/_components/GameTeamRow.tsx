import { GripVertical, Trash2 } from 'lucide-react'
import type { TeamDraft } from '../types'
import type { GameUser } from '../useGameUsers'
import { GamePlayerSearchSelect } from './GamePlayerSearchSelect'

interface GameTeamRowProps {
  index: number
  teams: TeamDraft[]
  users: GameUser[]
  playerLabels: string[]
  values: string[]
  onChange: (playerIndex: number, name: string) => void
  canRemove: boolean
  onRemove: () => void
}

export function GameTeamRow({
  index,
  teams,
  users,
  playerLabels,
  values,
  onChange,
  canRemove,
  onRemove,
}: GameTeamRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-green-100/40 p-3 sm:flex-row sm:items-stretch">
      <div className="flex items-start gap-2 sm:w-12 sm:shrink-0 sm:flex-col sm:items-center sm:pt-2">
        <span className="translate-y-2 cursor-pointer text-green-600" title="Ordem dos times">
          <GripVertical className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-mono text-sm font-semibold text-green-600 sm:hidden">#{index + 1}</span>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="cursor-pointer mt-1 rounded-lg p-1.5 text-red-700/70 transition hover:bg-red-100 hover:text-red-700"
            aria-label={`Remover time ${index + 1}`}
            title="Remover este time"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
        {playerLabels.map((label, pi) => (
          <GamePlayerSearchSelect
            key={pi}
            id={`team-${index}-player-${pi}`}
            label={`Time ${index + 1} — ${label}`}
            users={users}
            teams={teams}
            teamIndex={index}
            playerIndex={pi}
            value={values[pi] ?? ''}
            onChange={(name) => onChange(pi, name)}
          />
        ))}
      </div>
    </div>
  )
}
