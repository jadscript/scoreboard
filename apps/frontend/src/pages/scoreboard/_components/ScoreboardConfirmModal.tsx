import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  warning: "bg-yellow-500 hover:bg-yellow-400",
}

export function ScoreboardConfirmModal({
  title,
  message,
  confirmLabel,
  confirmTone,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4 cursor-default"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md bg-white border border-stone-300 rounded-none shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scoreboard-confirm-title"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-none text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="px-6 pt-6 pb-5 flex flex-col gap-4 pr-12">
          <div className="flex flex-col gap-1">
            <h2 id="scoreboard-confirm-title" className="text-lg font-semibold text-stone-900">
              {title}
            </h2>
            <p className="text-sm text-stone-500">{message}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-none border border-stone-300 text-stone-500 hover:bg-stone-100 text-sm font-medium transition-colors cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-none text-white text-sm font-semibold transition-colors cursor-pointer ${confirmClass[confirmTone]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
