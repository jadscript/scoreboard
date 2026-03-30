import {
  // ArrowDownUp,
  Maximize,
  Minimize,
  RotateCcw,
  Save,
  Settings,
  Undo2,
} from "lucide-react";

interface Props {
  isFullscreen: boolean;
  canUndo: boolean;
  canReset: boolean;
  matchFinished: boolean;
  saveToHistoryError: boolean;
  onInvertTeams: () => void;
  onToggleFullscreen: () => void;
  onRequestUndo: () => void;
  onRequestReset: () => void;
  onRequestSettings: () => void;
  onSaveMatchToHistory: () => void;
}

export function ScoreboardToolbar({
  isFullscreen,
  canUndo,
  canReset,
  matchFinished,
  saveToHistoryError,
  // onInvertTeams,
  onToggleFullscreen,
  onRequestUndo,
  onRequestReset,
  onRequestSettings,
  onSaveMatchToHistory,
}: Props) {
  const resetDisabled = matchFinished || !canReset;
  return (
    <div className="flex gap-8 items-center justify-between">
      {/* <div className="flex justify-start">
        <button
          type="button"
          onClick={onInvertTeams}
          className="transition-colors cursor-pointer bg-linear-to-r from-green-500 via-green-400 to-blue-500 hover:from-blue-600 hover:to-green-600 text-white rounded-full p-3"
          title="Inverter times"
        >
          <ArrowDownUp size={16} />
        </button>
      </div> */}

      <div className="flex justify-center items-center gap-2 flex-wrap">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onRequestUndo}
          className="disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3"
          title="Desfazer última ação"
        >
          <Undo2 size={16} />
        </button>

        {matchFinished && (
          <button
            type="button"
            onClick={onSaveMatchToHistory}
            className={`animate-transform transition-colors cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3 ${
              saveToHistoryError ? "ring-2 ring-red-500 ring-offset-2" : ""
            }`}
            title={
              saveToHistoryError
                ? "Não foi possível salvar — toque para tentar de novo"
                : "Salvar no histórico e começar nova partida"
            }
          >
            <Save size={24} />
          </button>
        )}

        <button
          type="button"
          disabled={resetDisabled}
          onClick={onRequestReset}
          className="disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
          title={
            matchFinished
              ? "Salve no histórico ou desfaça o último lance para poder resetar"
              : !canReset
                ? "Nada para resetar"
                : "Resetar partida"
          }
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onRequestSettings}
          className="transition-colors cursor-pointer bg-slate-600 hover:bg-slate-700 text-white rounded-full p-3"
          title="Configurações da partida"
        >
          <Settings size={16} />
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          className="transition-colors cursor-pointer bg-gray-500 hover:bg-gray-600 text-white rounded-full p-3"
          title={isFullscreen ? "Sair do fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>
    </div>
  );
}
