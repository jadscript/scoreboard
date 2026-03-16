import type { Gender } from '../../../core/domain/player.entity'

interface Props {
  gender: Gender
}

export function GenderBadge({ gender }: Props) {
  const label = gender === 'male' ? 'Masculino' : 'Feminino'
  const cls =
    gender === 'male'
      ? 'bg-sky-900/60 text-sky-300 ring-1 ring-sky-700'
      : 'bg-pink-900/60 text-pink-300 ring-1 ring-pink-700'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  )
}
