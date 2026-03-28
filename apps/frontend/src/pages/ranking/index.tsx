import { Link } from "@tanstack/react-router";
import { ArrowLeft, Trophy } from "lucide-react";
import { loadMatchHistory } from "../scoreboard/matchHistoryStorage";
import { buildPlayerRanking, buildTeamRanking } from "./rankingStats";
import { RankingStatTable } from "./_components/RankingStatTable";

function formatSavedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function RankingPage() {
  const matches = loadMatchHistory();
  const playerRanking = buildPlayerRanking(matches);
  const teamRanking = buildTeamRanking(matches);

  const emptyHint =
    'Nenhuma partida salva ainda. Encerre uma partida no placar e use "Salvar jogo" para aparecer aqui.';

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto flex min-w-0 max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
                <Trophy className="h-5 w-5" aria-hidden />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Ranking</h1>
            </div>
            <p className="mt-2 text-sm opacity-60">
              Jogadores e times ordenados por vitórias, com partidas e derrotas (dados das
              partidas salvas no placar).
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Configuração
          </Link>
        </header>

        <RankingStatTable
          title="Jogadores"
          emptyMessage={emptyHint}
          rows={playerRanking}
          nameColumnFull="Jogador"
          nameColumnAbbr="J"
          titleAttrForAbbr="Jogador"
        />

        <RankingStatTable
          title="Times"
          emptyMessage={emptyHint}
          rows={teamRanking}
          nameColumnFull="Time"
          nameColumnAbbr="T"
          titleAttrForAbbr="Time"
        />

        <section className="border-3 min-w-0 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Todas as partidas</h2>
          {matches.length === 0 ? (
            <p className="mt-4 text-sm opacity-60">Nenhum registro no histórico.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {matches.map((m) => {
                const s1 = m.finalSets.team1;
                const s2 = m.finalSets.team2;
                const w =
                  s1 > s2 ? m.team1Name : s2 > s1 ? m.team2Name : null;
                return (
                  <li
                    key={m.id}
                    className="flex flex-col gap-1 rounded-xl border border-black/15 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="font-medium">
                      <span>{m.team1Name}</span>
                      <span className="mx-2 opacity-40">×</span>
                      <span>{m.team2Name}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 opacity-80">
                      <span className="tabular-nums">
                        Sets {s1}–{s2}
                      </span>
                      {w && (
                        <span>
                          Vitória:{" "}
                          {w.trim() || (s1 > s2 ? "Time 1" : "Time 2")}
                        </span>
                      )}
                      <time className="text-xs opacity-60" dateTime={m.savedAt}>
                        {formatSavedAt(m.savedAt)}
                      </time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
