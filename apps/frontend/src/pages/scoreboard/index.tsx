import { Maximize, Minimize, RotateCcw, Undo2 } from "lucide-react";
import { useRef, useState } from "react";
import { useScoreboard } from "../../hooks/useScoreboard";
import { ScoreboardConfirmModal } from "./_components/ScoreboardConfirmModal";

const Divider = ({ className }: { className?: string }) => (
  <div className={`w-[2px] h-[45px] bg-gray-300 rounded-full ${className}`} />
);

export function ScoreboardPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);
  const [scoredTeam, setScoredTeam] = useState<"team1" | "team2" | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const triggerFlash = (team: "team1" | "team2") => {
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    setScoredTeam(team);
    flashTimeoutRef.current = setTimeout(() => setScoredTeam(null), 1000);
  };

  const {
    handleScore,
    handleUndo,
    handleReset,
    canUndo,
    canReset,
    undoActionDescription,
    team1Score,
    team2Score,
    games,
    setHistory,
    serving,
    courtSwitched,
    team1Name,
    team2Name,
    setTeamName,
  } = useScoreboard({ onScore: triggerFlash });

  const handleScoreWithFlash = (team: "team1" | "team2") => {
    handleScore(team);
    triggerFlash(team);
  };

  return (
    <div className="flex flex-col items-center justify-between p-4 w-full h-screen">
      <div className="w-full grid grid-rows-1 grid-cols-2 items-center justify-center h-full border-8 border-black">
        <div className="absolute top-0 left-0 right-0 flex justify-center">
          <div className="flex flex-wrap px-6 py-2 m-3 bg-white text-black rounded-2xl items-center gap-x-4 gap-y-2 shadow-md">
            {/* Info group: team labels + set scores */}
            <div className="flex gap-4 flex-1">
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 shrink-0 bg-green-600 rounded-full" />
                  <input
                    type="text"
                    value={team1Name}
                    onChange={(e) => setTeamName("team1", e.target.value)}
                    className="flex font-bold text-sm border-b border-transparent hover:border-gray-300 focus:border-black outline-none"
                    style={{ width: `${team1Name.length}ch` }}
                    aria-label="Nome do time 1"
                    maxLength={40}
                  />
                  <div
                    className={`w-2.5 h-2.5 shrink-0 rounded-full bg-black transition-opacity duration-200 ${serving === "team1" ? "opacity-100" : "opacity-0"}`}
                  />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 shrink-0 bg-blue-600 rounded-full" />
                  <input
                    type="text"
                    value={team2Name}
                    onChange={(e) => setTeamName("team2", e.target.value)}
                    className="flex font-bold text-sm border-b border-transparent hover:border-gray-300 focus:border-black outline-none"
                    style={{ width: `${team2Name.length}ch` }}
                    aria-label="Nome do time 2"
                    maxLength={40}
                  />
                  <div
                    className={`w-2.5 h-2.5 shrink-0 rounded-full bg-black transition-opacity duration-200 ${serving === "team2" ? "opacity-100" : "opacity-0"}`}
                  />
                </div>
              </div>

              <Divider />

              <div className="flex gap-4">
                {Array.from({ length: 3 }, (_, i) => {
                  const completed = setHistory[i];
                  const isCurrent = i === setHistory.length;
                  const t1 = completed
                    ? completed.team1
                    : isCurrent
                      ? games.team1
                      : 0;
                  const t2 = completed
                    ? completed.team2
                    : isCurrent
                      ? games.team2
                      : 0;
                  const team1Won = completed
                    ? completed.team1 > completed.team2
                    : null;
                  return (
                    <div key={i} className="flex flex-col gap-1 items-center">
                      <span
                        className={`font-bold text-sm w-3 text-center ${team1Won === false ? "opacity-40" : ""}`}
                      >
                        {t1}
                      </span>
                      <span
                        className={`font-bold text-sm w-3 text-center ${team1Won === true ? "opacity-40" : ""}`}
                      >
                        {t2}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions group: fullscreen, undo, reset */}
            <div className="flex items-center gap-2 w-full justify-center border-t-2 border-gray-300 pt-2">
              <button
                onClick={toggleFullscreen}
                className="transition-colors cursor-pointer bg-gray-500 hover:bg-gray-600 text-white rounded-full p-3"
                title={isFullscreen ? "Sair do fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>

              <button
                type="button"
                disabled={!canUndo}
                onClick={() => setUndoConfirmOpen(true)}
                className="disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3"
                title="Desfazer última ação"
              >
                <Undo2 size={16} />
              </button>

              <button
                type="button"
                disabled={!canReset}
                onClick={() => setResetConfirmOpen(true)}
                className="disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
                title="Resetar partida"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-center h-full cursor-pointer border-black ${!courtSwitched ? "order-1 border-r-4" : "order-2 border-l-4"} ${scoredTeam === "team1" ? "score-flash-green" : "text-green-700 hover:bg-green-600 hover:text-white transition-colors"}`}
          onClick={() => handleScoreWithFlash("team1")}
        >
          <h1
            className={`font-bold w-full text-center text-[25vw] leading-none score-font ${team1Score === "40" ? "animate-transform" : ""}`}
          >
            {team1Score}
          </h1>
        </div>
        <div
          className={`flex items-center justify-center h-full cursor-pointer border-black ${courtSwitched ? "order-1 border-r-4" : "order-2 border-l-4"} ${scoredTeam === "team2" ? "score-flash-blue" : "text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"}`}
          onClick={() => handleScoreWithFlash("team2")}
        >
          <h1
            className={`font-bold w-full text-center text-[25vw] leading-none score-font ${team2Score === "40" ? "animate-transform" : ""}`}
          >
            {team2Score}
          </h1>
        </div>
      </div>

      {resetConfirmOpen && (
        <ScoreboardConfirmModal
          title="Resetar partida"
          message="Zerar placar, games e sets? O histórico de desfazer também será limpo."
          confirmLabel="Resetar"
          confirmTone="danger"
          onCancel={() => setResetConfirmOpen(false)}
          onConfirm={() => {
            handleReset();
            setResetConfirmOpen(false);
          }}
        />
      )}

      {undoConfirmOpen && undoActionDescription !== null && (
        <ScoreboardConfirmModal
          title="Desfazer última ação"
          message={`Será desfeito: ${undoActionDescription}.`}
          confirmLabel="Desfazer"
          confirmTone="warning"
          onCancel={() => setUndoConfirmOpen(false)}
          onConfirm={() => {
            handleUndo();
            setUndoConfirmOpen(false);
          }}
        />
      )}
    </div>
  );
}
