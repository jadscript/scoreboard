import { Link, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, Settings2, Trophy, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { bootstrapScoreboardMatch } from "../../hooks/useScoreboard";
import { GameAddTeamButton } from "./_components/GameAddTeamButton";
import { GameConfigCard } from "./_components/GameConfigCard";
import { GameUsersSection } from "./_components/GameUsersSection";
import {
  GameNativeSelect,
  GameSelectField,
} from "./_components/GameSelectField";
import { GameSegmentedControl } from "./_components/GameSegmentedControl";
import { GameTeamRow } from "./_components/GameTeamRow";
import {
  GAME_FORMAT_LABELS,
  GAME_FORMAT_OPTIONS,
  type GameFormat,
  type GamesPerSetOption,
  type MatchSetsOption,
  type TeamDraft,
  isSinglesFormat,
  playersPerTeamForFormat,
} from "./types";
import {
  emptyTeam,
  loadGameSetup,
  MIN_TEAMS,
  resizeNames,
  saveGameSetup,
} from "./gameSetupStorage";
import {
  formatTeamDisplayName,
  getExcludedNameKeys,
  normalizePlayerKey,
} from "./playerSelection";
import { useGameUsers } from "./useGameUsers";

export function GamePage() {
  const navigate = useNavigate();
  const { users, addUser, removeUser } = useGameUsers();
  const initialSetup = useMemo(() => loadGameSetup(), []);
  const [gameFormat, setGameFormat] = useState<GameFormat>(
    () => initialSetup.gameFormat,
  );
  const [gamesPerSet, setGamesPerSet] = useState<GamesPerSetOption>(
    () => initialSetup.gamesPerSet,
  );
  const [matchSets, setMatchSets] = useState<MatchSetsOption>(
    () => initialSetup.matchSets,
  );
  const [teams, setTeams] = useState<TeamDraft[]>(() => initialSetup.teams);

  useEffect(() => {
    const id = window.setTimeout(() => {
      saveGameSetup({
        gameFormat,
        gamesPerSet,
        matchSets,
        teams,
      });
    }, 300);
    return () => window.clearTimeout(id);
  }, [gameFormat, gamesPerSet, matchSets, teams]);

  const playersPerTeam = playersPerTeamForFormat(gameFormat);

  const onFormatChange = useCallback((next: GameFormat) => {
    setGameFormat(next);
    const n = playersPerTeamForFormat(next);
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        playerNames: resizeNames(t.playerNames, n),
      })),
    );
  }, []);

  const addTeam = useCallback(() => {
    setTeams((prev) => [...prev, emptyTeam(playersPerTeam)]);
  }, [playersPerTeam]);

  const removeTeam = useCallback((teamIndex: number) => {
    setTeams((prev) => {
      if (prev.length <= MIN_TEAMS) return prev;
      return prev.filter((_, i) => i !== teamIndex);
    });
  }, []);

  const updatePlayerName = useCallback(
    (teamIndex: number, playerIndex: number, name: string) => {
      setTeams((prev) => {
        const key = normalizePlayerKey(name);
        if (key.length > 0) {
          const excluded = getExcludedNameKeys(prev, teamIndex, playerIndex);
          if (excluded.has(key)) return prev;
        }
        return prev.map((t, i) => {
          if (i !== teamIndex) return t;
          const nextNames = [...t.playerNames];
          nextNames[playerIndex] = name;
          return { ...t, playerNames: nextNames };
        });
      });
    },
    [],
  );

  const canStart = useMemo(() => {
    if (teams.length < 2) return false;
    const t1 = teams[0];
    const t2 = teams[1];
    if (!t1 || !t2) return false;
    const namesOk = (t: TeamDraft) =>
      t.playerNames.every((n) => n.trim().length > 0) &&
      t.playerNames.length === playersPerTeam;
    return namesOk(t1) && namesOk(t2);
  }, [teams, playersPerTeam]);

  const handleStart = () => {
    if (!canStart) return;
    const t1 = teams[0];
    const t2 = teams[1];
    if (!t1 || !t2) return;
    const team1Name = formatTeamDisplayName(t1.playerNames);
    const team2Name = formatTeamDisplayName(t2.playerNames);
    bootstrapScoreboardMatch({
      team1Name,
      team2Name,
      gamesToWinSet: gamesPerSet,
      setsToWinMatch: matchSets,
    });
    void navigate({ to: "/scoreboard" });
  };

  const gamesOptions = useMemo(
    () =>
      ([2, 3, 4, 5, 6] as const).map((n) => ({
        value: String(n),
        label: String(n),
      })),
    [],
  );

  const matchSetsOptions = useMemo(
    () =>
      ([1, 2, 3] as const).map((n) => ({
        value: String(n),
        label: String(n),
      })),
    [],
  );

  const playerLabelsForRow = useMemo(() => {
    if (playersPerTeam === 1) return ["Jogador"];
    return ["Jogador 1", "Jogador 2"];
  }, [playersPerTeam]);

  return (
    <div className="min-h-screen  px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Configurações de partida
          </h1>
          <p className="mt-2 text-sm opacity-60">
            Configure o formato, regras de set e os times antes de ir ao placar.
          </p>
        </header>

        <GameConfigCard
          title="Tipo de jogo"
          subtitle="Formato da partida e composição dos times"
          defaultOpen={false}
          icon={<Settings2 className="h-5 w-5" aria-hidden />}
        >
          <div className="flex flex-col gap-6 pt-2">
            <GameSelectField
              label="Formato"
              description="Simples: um jogador por time. Dupla: dois jogadores por time."
              control={
                <GameSegmentedControl
                  ariaLabel="Tipo de jogo"
                  value={gameFormat}
                  onChange={onFormatChange}
                  options={GAME_FORMAT_OPTIONS.map((value) => ({
                    value,
                    label: GAME_FORMAT_LABELS[value],
                  }))}
                />
              }
            />
          </div>
        </GameConfigCard>

        <GameConfigCard
          title="Regras do set e da partida"
          subtitle="Games por set (2 a 6) e sets na partida (1 a 3)"
          icon={<SlidersHorizontal className="h-5 w-5" aria-hidden />}
          defaultOpen={false}
        >
          <div className="flex flex-col gap-8 pt-2">
            <GameSelectField
              label="Games para vencer o set"
              description="De 2 a 6 games. Quando empatar nesse número (ex.: 6–6), joga-se o tie-break."
              control={
                <GameNativeSelect
                  id="games-per-set"
                  value={String(gamesPerSet)}
                  onChange={(v) =>
                    setGamesPerSet(Number(v) as GamesPerSetOption)
                  }
                  options={gamesOptions}
                />
              }
            />
            <GameSelectField
              label="Sets para vencer a partida"
              description="De 1 a 3: quantas vitórias em sets são precisas para ganhar a partida."
              control={
                <GameNativeSelect
                  id="match-sets"
                  value={String(matchSets)}
                  onChange={(v) =>
                    setMatchSets(Number(v) as MatchSetsOption)
                  }
                  options={matchSetsOptions}
                />
              }
            />
          </div>
        </GameConfigCard>

        <GameUsersSection users={users} onAdd={addUser} onRemove={removeUser} />

        <GameConfigCard
          title="Times"
          subtitle="Busque jogadores salvos ou digite um nome. O mesmo jogador não pode estar em dois times."
          icon={<Users className="h-5 w-5" aria-hidden />}
          defaultOpen={false}
        >
          <div className="flex flex-col gap-4 pt-2">
            <p className="text-sm font-bold">
              {isSinglesFormat(gameFormat)
                ? "Um nome por time."
                : "Dois nomes por time."}
            </p>
            <div className="flex flex-col gap-3">
              {teams.map((team, index) => (
                <GameTeamRow
                  key={team.id}
                  index={index}
                  teams={teams}
                  users={users}
                  playerLabels={playerLabelsForRow}
                  values={team.playerNames}
                  onChange={(pi, name) => updatePlayerName(index, pi, name)}
                  canRemove={teams.length > MIN_TEAMS}
                  onRemove={() => removeTeam(index)}
                />
              ))}
            </div>
            <GameAddTeamButton onClick={addTeam} />
          </div>
        </GameConfigCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/ranking"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-600 bg-yellow-600/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-yellow-700"
          >
            <Trophy className="h-4 w-4 shrink-0" aria-hidden />
            Ranking
          </Link>
          <button
            type="button"
            disabled={!canStart}
            onClick={handleStart}
            className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ir para o placar
          </button>
        </div>
      </div>
    </div>
  );
}
