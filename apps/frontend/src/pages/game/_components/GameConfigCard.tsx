import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface GameConfigCardProps {
  title: string
  subtitle: string
  icon: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

export function GameConfigCard({
  title,
  subtitle,
  icon,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  children,
}: GameConfigCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <section className="border-3">
      <button
        type="button"
        className="cursor-pointer flex w-full items-start gap-3 px-5 py-4 text-left transition rounded-t-2xl"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{title}</span>
          <span className="mt-0.5 block text-sm opacity-60">{subtitle}</span>
        </span>
        <span className="shrink-0">
          {open ? <ChevronUp className="h-5 w-5" aria-hidden /> : <ChevronDown className="h-5 w-5" aria-hidden />}
        </span>
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </section>
  )
}
