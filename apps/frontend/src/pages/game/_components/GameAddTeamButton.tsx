import { Plus } from 'lucide-react'

interface GameAddTeamButtonProps {
  onClick: () => void
  label?: string
}

export function GameAddTeamButton({ onClick, label = 'Adicionar outro time' }: GameAddTeamButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-green-600 bg-green-100/40 py-3 text-sm font-medium text-green-600 transition hover:border-green-500 hover:bg-green-500 hover:text-white"
    >
      <Plus className="h-4 w-4" aria-hidden />
      {label}
    </button>
  )
}
