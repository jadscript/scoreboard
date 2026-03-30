import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { loadGameSetup } from "../game/gameSetupStorage";
import { playersPerTeamForFormat } from "../game/types";
import { useGameUsers } from "../game/useGameUsers";
import { useScoreboard } from "../../hooks/useScoreboard";
import { appendSavedMatch } from "./matchHistoryStorage";
import { ScoreboardConfirmModal } from "./_components/ScoreboardConfirmModal";
import { ScoreboardInfoGroup } from "./_components/ScoreboardInfoGroup";
import { ScoreboardScorePanel } from "./_components/ScoreboardScorePanel";
import { ScoreboardToolbar } from "./_components/ScoreboardToolbar";

export function ScoreboardPage() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsConfirmOpen, setSettingsConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);
  const [scoredTeam, setScoredTeam] = useState<"team1" | "team2" | null>(null);
  const [matchHistorySaveError, setMatchHistorySaveError] = useState(false);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMatchHistorySaveError = useCallback(() => {
    setMatchHistorySaveError(false);
  }, []);

  const { users } = useGameUsers();
  const gameSetup = useMemo(() => loadGameSetup(), []);
  const playersPerTeam = playersPerTeamForFormat(gameSetup.gameFormat);

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
    sets,
    gamesToWinSet,
    setsToWinMatch,
    setHistory,
    pointEvents,
    serving,
    courtSwitched,
    team1Name,
    team2Name,
    setTeamName,
    handleInvertTeams,
    matchFinished,
  } = useScoreboard({
    onScore: triggerFlash,
    onAfterUndo: clearMatchHistorySaveError,
  });

  const handleInvertTeamsAndClearHistorySave = useCallback(() => {
    handleInvertTeams();
    clearMatchHistorySaveError();
  }, [handleInvertTeams, clearMatchHistorySaveError]);

  const handleResetAndClearHistorySave = useCallback(() => {
    handleReset();
    clearMatchHistorySaveError();
  }, [handleReset, clearMatchHistorySaveError]);

  const handleSaveMatchToHistory = useCallback(() => {
    const saved = appendSavedMatch({
      team1Name,
      team2Name,
      gamesToWinSet,
      setsToWinMatch,
      finalSets: { team1: sets.team1, team2: sets.team2 },
      setGameScores: setHistory.map((s) => ({
        team1: s.team1,
        team2: s.team2,
      })),
      pointEvents,
    });
    if (saved) {
      setMatchHistorySaveError(false);
      handleReset();
    } else {
      setMatchHistorySaveError(true);
    }
  }, [
    handleReset,
    team1Name,
    team2Name,
    gamesToWinSet,
    setsToWinMatch,
    sets.team1,
    sets.team2,
    setHistory,
    pointEvents,
  ]);

  const handleScoreWithFlash = (team: "team1" | "team2") => {
    handleScore(team);
    triggerFlash(team);
  };

  return (
    <div className="flex flex-col items-center justify-between p-4 w-full h-screen">
      <div className="w-full grid grid-rows-1 grid-cols-2 items-center justify-center h-full border-8 border-black">
        <div className="absolute top-0 left-0 right-0 flex justify-center max-w-2xl mx-auto px-1">
          <div className="flex flex-wrap px-6 py-2 m-3 bg-white text-black rounded-2xl items-center gap-x-4 gap-y-2 shadow-md">
            <ScoreboardInfoGroup
              team1Name={team1Name}
              team2Name={team2Name}
              setTeamName={setTeamName}
              serving={serving}
              games={games}
              setHistory={setHistory}
              setsToWinMatch={setsToWinMatch}
              playersPerTeam={playersPerTeam}
              users={users}
            />
          </div>
        </div>

        <ScoreboardScorePanel
          team="team1"
          score={team1Score}
          courtSwitched={courtSwitched}
          scoredTeam={scoredTeam}
          onScore={() => handleScoreWithFlash("team1")}
        />
        <ScoreboardScorePanel
          team="team2"
          score={team2Score}
          courtSwitched={courtSwitched}
          scoredTeam={scoredTeam}
          onScore={() => handleScoreWithFlash("team2")}
        />

        <div className="absolute bottom-0 left-0 right-0 flex justify-center max-w-2xl mx-auto px-1">
          <div className="flex flex-wrap px-4 py-2 m-3 bg-white text-black rounded-2xl items-center gap-x-4 gap-y-2 shadow-md">
            <ScoreboardToolbar
              isFullscreen={isFullscreen}
              canUndo={canUndo}
              canReset={canReset}
              matchFinished={matchFinished}
              saveToHistoryError={matchHistorySaveError}
              onInvertTeams={handleInvertTeamsAndClearHistorySave}
              onToggleFullscreen={toggleFullscreen}
              onRequestUndo={() => setUndoConfirmOpen(true)}
              onRequestReset={() => setResetConfirmOpen(true)}
              onRequestSettings={() => setSettingsConfirmOpen(true)}
              onSaveMatchToHistory={handleSaveMatchToHistory}
            />
          </div>
        </div>
      </div>

      {settingsConfirmOpen && (
        <ScoreboardConfirmModal
          title="Ir para configuração"
          message="Ao sair do placar para a configuração, o jogo atual será reiniciado. Deseja continuar?"
          confirmLabel="Ir para configuração"
          confirmTone="warning"
          onCancel={() => setSettingsConfirmOpen(false)}
          onConfirm={() => {
            setSettingsConfirmOpen(false);
            navigate({ to: "/" });
          }}
        />
      )}

      {resetConfirmOpen && (
        <ScoreboardConfirmModal
          title="Resetar partida"
          message="Zerar placar, games e sets? O histórico de desfazer também será limpo."
          confirmLabel="Resetar"
          confirmTone="danger"
          onCancel={() => setResetConfirmOpen(false)}
          onConfirm={() => {
            handleResetAndClearHistorySave();
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
