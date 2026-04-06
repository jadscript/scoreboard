import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { loadGameSetup } from "../home/gameSetupStorage";
import { playersPerTeamForFormat } from "../home/types";
import {
  buildGameAudioKey,
  getServingTeamForGame,
  isGameWinningPoint,
  teamPointClipKey,
} from "../../infrastructure/audio/segmentedVoiceHelpers";
import { SegmentedVoicePlayer } from "../../infrastructure/audio/segmentedVoicePlayer";
import { useScoreboard, type Snapshot } from "../../hooks/useScoreboard";
import { appendSavedMatch } from "./matchHistoryStorage";
import { ScoreboardConfirmModal } from "./_components/ScoreboardConfirmModal";
// import { ScoreboardInfoGroup } from "./_components/ScoreboardInfoGroup";
import { ScoreboardScorePanel } from "./_components/ScoreboardScorePanel";
import { ScoreboardToolbar } from "./_components/ScoreboardToolbar";
import { useTranslation } from "react-i18next";

export function ScoreboardPage() {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsConfirmOpen, setSettingsConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);
  const [scoredTeam, setScoredTeam] = useState<"team1" | "team2" | null>(null);
  const [matchHistorySaveError, setMatchHistorySaveError] = useState(false);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation();

  const clearMatchHistorySaveError = useCallback(() => {
    setMatchHistorySaveError(false);
  }, []);

  // const { users } = useGameUsers();
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

  const voicePlayerRef = useRef(
    new SegmentedVoicePlayer({
      audioUrl: "/voices/man.mp3",
      manifestUrl: "/voices/man.json",
    }),
  );

  const onAfterScore = useCallback(
    ({ team, priorSnapshot }: { team: "team1" | "team2"; priorSnapshot: Snapshot }) => {
      const player = voicePlayerRef.current;
      void player.resumeContext().then(() => {
        const pointsAfter = {
          team1: priorSnapshot.points.team1 + (team === "team1" ? 1 : 0),
          team2: priorSnapshot.points.team2 + (team === "team2" ? 1 : 0),
        };
        const servingDuringPoint = getServingTeamForGame(priorSnapshot.games);
        const clips: string[] = [teamPointClipKey(team)];
        const tb = priorSnapshot.isTiebreak;
        if (isGameWinningPoint(pointsAfter, tb)) {
          clips.push("game_ended");
        } else if (!tb) {
          const gameKey = buildGameAudioKey(pointsAfter, servingDuringPoint, false);
          if (gameKey) clips.push(gameKey);
        }
        player.playSequence(clips);
      });
    },
    [],
  );

  const {
    handleScore,
    handleUndo,
    handleReset,
    canUndo,
    canReset,
    undoActionDescription,
    team1Score,
    team2Score,
    points,
    games,
    sets,
    gamesToWinSet,
    setsToWinMatch,
    setHistory,
    pointEvents,
    isTiebreak,
    serving,
    courtSwitched,
    team1Name,
    team2Name,
    // setTeamName,
    handleInvertTeams,
    matchFinished,
  } = useScoreboard({
    onScore: triggerFlash,
    onAfterUndo: clearMatchHistorySaveError,
    onAfterScore,
  });

  useEffect(() => {
    void voicePlayerRef.current.load().catch(() => {
      /* offline / blocked */
    });
  }, []);

  const prevCleanRef = useRef(false);
  useEffect(() => {
    const clean =
      !canUndo &&
      points.team1 === 0 &&
      points.team2 === 0 &&
      games.team1 === 0 &&
      games.team2 === 0 &&
      sets.team1 === 0 &&
      sets.team2 === 0 &&
      !isTiebreak &&
      !matchFinished;

    if (clean && !prevCleanRef.current) {
      const player = voicePlayerRef.current;
      void player.resumeContext().then(() => {
        player.playClip("startGame");
      });
    }
    prevCleanRef.current = clean;
  }, [
    canUndo,
    points.team1,
    points.team2,
    games.team1,
    games.team2,
    sets.team1,
    sets.team2,
    isTiebreak,
    matchFinished,
  ]);

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

  return (
    <div className="flex flex-col items-center justify-between p-2 md:p-4 w-full h-screen bg-white">
      <div className="w-full grid grid-rows-2 grid-cols-1 md:grid-rows-1 md:grid-cols-2 items-center justify-center h-full border-5 md:border-8 border-stone-900">
        <div className="absolute md:top-0 left-0 md:left-auto right-0 flex justify-center max-w-2xl mx-auto md:mr-3 px-1 z-10">
          <div className="flex flex-col flex-wrap bg-white border-5 md:border-8 border-stone-900 text-stone-900 items-center gap-x-4 gap-y-2 md:mt-4">
            {/* <ScoreboardInfoGroup
              team1Name={team1Name}
              team2Name={team2Name}
              setTeamName={setTeamName}
              serving={serving}
              games={games}
              setHistory={setHistory}
              setsToWinMatch={setsToWinMatch}
              matchFinished={matchFinished}
              playersPerTeam={playersPerTeam}
              users={[]}
            /> */}
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

        <ScoreboardScorePanel
          team="team1"
          score={team1Score}
          courtSwitched={courtSwitched}
          scoredTeam={scoredTeam}
          onScore={() => handleScore("team1")}
          games={games}
          setHistory={setHistory}
          setsToWinMatch={setsToWinMatch}
          matchFinished={matchFinished}
          playersPerTeam={playersPerTeam}
          users={[]}
          isServing={serving === "team1"}
        />
        <ScoreboardScorePanel
          team="team2"
          score={team2Score}
          courtSwitched={courtSwitched}
          scoredTeam={scoredTeam}
          onScore={() => handleScore("team2")}
          games={games}
          setHistory={setHistory}
          setsToWinMatch={setsToWinMatch}
          matchFinished={matchFinished}
          playersPerTeam={playersPerTeam}
          users={[]}
          isServing={serving === "team2"}
        />

        {/* <div className="absolute bottom-0 left-0 md:right-0 flex justify-center max-w-2xl mx-auto px-1">
          <div className="flex flex-wrap px-4 py-2 m-3 bg-white text-stone-900 rounded-none items-center gap-x-4 gap-y-2 shadow-md">
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
        </div> */}
      </div>

      {settingsConfirmOpen && (
        <ScoreboardConfirmModal
          title={t("scoreboard.homeConfirmModal.title")}
          message={t("scoreboard.homeConfirmModal.message")}
          confirmLabel={t("scoreboard.homeConfirmModal.confirmLabel")}
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
          title={t("scoreboard.resetConfirmModal.title")}
          message={t("scoreboard.resetConfirmModal.message")}
          confirmLabel={t("scoreboard.resetConfirmModal.confirmLabel")}
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
          title={t("scoreboard.undoConfirmModal.title")}
          message={t("scoreboard.undoConfirmModal.message", { action: undoActionDescription })}
          confirmLabel={t("scoreboard.undoConfirmModal.confirmLabel")}
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
