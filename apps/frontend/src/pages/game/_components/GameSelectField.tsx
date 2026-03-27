import type { ReactNode } from 'react'

interface GameSelectFieldProps {
  label: string
  description?: string
  control: ReactNode
}

export function GameSelectField({ label, description, control }: GameSelectFieldProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{label}</p>
        {description ? <p className="mt-1 text-sm opacity-60">{description}</p> : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

interface GameNativeSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  id: string
}

export function GameNativeSelect({ value, onChange, options, id }: GameNativeSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-xl bg-green-100/40 py-2.5 pl-3 pr-10 text-sm font-medium text-green-600 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-green-600" aria-hidden>
        ▼
      </span>
    </div>
  )
}
