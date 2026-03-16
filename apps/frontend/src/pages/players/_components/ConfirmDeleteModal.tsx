interface Props {
  playerName: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function ConfirmDeleteModal({ playerName, onConfirm, onCancel }: Props) {
  async function handleConfirm() {
    await onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="px-6 pt-6 pb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-50">Excluir player</h2>
            <p className="text-sm text-slate-400">
              Tem certeza que deseja excluir{' '}
              <span className="text-slate-200 font-medium">{playerName}</span>? Essa ação não pode ser desfeita.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
