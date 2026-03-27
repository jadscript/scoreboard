import { X } from "lucide-react";

interface Props {
  title: string
  message: string
  confirmLabel: string
  confirmTone: "danger" | "warning"
  onConfirm: () => void
  onCancel: () => void
}

const confirmClass: Record<Props["confirmTone"], string> = {
  danger: "bg-red-600 hover:bg-red-500",
  warning: "bg-amber-600 hover:bg-amber-500",
}

export function ScoreboardConfirmModal({
  title,
  message,
  confirmLabel,
  confirmTone,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 cursor-default"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md bg-white border border-gray-300 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scoreboard-confirm-title"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="px-6 pt-6 pb-5 flex flex-col gap-4 pr-12">
          <div className="flex flex-col gap-1">
            <h2 id="scoreboard-confirm-title" className="text-lg font-semibold text-black">
              {title}
            </h2>
            <p className="text-sm text-gray-500">{message}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors cursor-pointer ${confirmClass[confirmTone]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
