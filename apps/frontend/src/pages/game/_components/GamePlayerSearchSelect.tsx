import { ChevronDown, Search } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { TeamDraft } from '../types'
import { getExcludedNameKeys, normalizePlayerKey } from '../playerSelection'
import type { GameUser } from '../useGameUsers'

interface GamePlayerSearchSelectProps {
  id: string
  label: string
  users: GameUser[]
  teams: TeamDraft[]
  teamIndex: number
  playerIndex: number
  value: string
  onChange: (name: string) => void
}

export function GamePlayerSearchSelect({
  id,
  label,
  users,
  teams,
  teamIndex,
  playerIndex,
  value,
  onChange,
}: GamePlayerSearchSelectProps) {
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const excludedNameKeys = useMemo(
    () => getExcludedNameKeys(teams, teamIndex, playerIndex),
    [teams, teamIndex, playerIndex],
  )

  const currentKey = normalizePlayerKey(value)

  const selectableUsers = useMemo(() => {
    return users.filter((u) => {
      const k = normalizePlayerKey(u.name)
      return !excludedNameKeys.has(k) || k === currentKey
    })
  }, [users, excludedNameKeys, currentKey])

  const qLower = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    return selectableUsers.filter((u) => u.name.toLowerCase().includes(qLower))
  }, [selectableUsers, qLower])

  const tryCommit = useCallback(
    (raw: string) => {
      const name = raw.trim().slice(0, 80)
      const k = normalizePlayerKey(name)
      if (k.length > 0 && excludedNameKeys.has(k) && k !== currentKey) {
        setQuery(value)
        setOpen(false)
        return
      }
      onChange(name)
      setQuery(name)
      setOpen(false)
    },
    [excludedNameKeys, currentKey, onChange, value],
  )

  const handleBlur = () => {
    window.setTimeout(() => {
      const root = containerRef.current
      if (root?.contains(document.activeElement)) return
      tryCommit(query)
    }, 0)
  }

  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-green-700/50"
            aria-hidden
          />
          <input
            id={id}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            value={open ? query : value}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => {
              setQuery(value)
              setOpen(true)
            }}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                tryCommit(query)
              }
              if (e.key === 'Escape') {
                setQuery(value)
                setOpen(false)
              }
            }}
            placeholder="Buscar ou digitar nome…"
            autoComplete="off"
            className="w-full font-bold rounded-xl border border-green-200/80 bg-green-100/40 py-2 pl-9 pr-9 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            tabIndex={-1}
            className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-1 text-green-700/60 hover:bg-green-200/50"
            aria-label="Abrir lista"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery(value)
              setOpen((o) => !o)
            }}
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-green-200 bg-white py-1 shadow-lg"
          >
            {selectableUsers.length === 0 && users.length > 0 ? (
              <li className="px-3 py-2 text-sm text-amber-800">
                Todos os jogadores salvos já estão em outros times.
              </li>
            ) : null}
            {filtered.length === 0 && selectableUsers.length > 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">Nenhum resultado</li>
            ) : null}
            {filtered.map((u) => (
              <li key={u.id} role="option">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-green-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => tryCommit(u.name)}
                >
                  {u.name}
                </button>
              </li>
            ))}
            {query.trim().length > 0 &&
              !users.some((u) => normalizePlayerKey(u.name) === normalizePlayerKey(query)) && (
                <li className="border-t border-slate-100">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-violet-700 hover:bg-violet-50"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => tryCommit(query)}
                  >
                    Usar “{query.trim()}”
                  </button>
                </li>
              )}
          </ul>
        )}
      </div>
    </label>
  )
}
