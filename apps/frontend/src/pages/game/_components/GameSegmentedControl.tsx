interface Option<T extends string> {
  value: T
  label: string
}

interface GameSegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

export function GameSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: GameSegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex justify-end gap-1 rounded-xl bg-green-100/40 p-1 shadow-inner w-fit mx-auto"
    >
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer',
              selected
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-green-600 hover:text-green-700',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
