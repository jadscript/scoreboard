import { Link } from "@tanstack/react-router";
import { ArrowLeft, Trophy } from "lucide-react";
import { loadMatchHistory } from "../scoreboard/matchHistoryStorage";
import { buildTeamRanking } from "./rankingStats";

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
  const ranking = buildTeamRanking(matches);

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
              Times ordenados por vitórias, com partidas jogadas e derrotas (dados das
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

        <section className="border-3 min-w-0 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Times</h2>
          {ranking.length === 0 ? (
            <p className="mt-4 text-sm opacity-60">
              Nenhuma partida salva ainda. Encerre uma partida no placar e use &quot;Salvar
              jogo&quot; para aparecer aqui.
            </p>
          ) : (
            <div className="mt-4 min-w-0">
              <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
                <colgroup>
                  <col className="w-7 sm:w-9" />
                  <col />
                  <col className="w-8 sm:w-14" />
                  <col className="w-8 sm:w-14" />
                  <col className="w-8 sm:w-16" />
                </colgroup>
                <thead>
                  <tr className="border-b border-black/20">
                    <th className="pb-2 pr-1 font-medium opacity-60 sm:pb-3 sm:pr-2">
                      #
                    </th>
                    <th className="pb-2 pr-1 font-medium opacity-60 sm:pb-3 sm:pr-3">
                      <abbr
                        title="Time"
                        className="cursor-help no-underline sm:hidden"
                      >
                        T
                      </abbr>
                      <span className="hidden sm:inline">Time</span>
                    </th>
                    <th className="pb-2 pr-0 text-right font-medium opacity-60 sm:pb-3 sm:pr-2">
                      <abbr
                        title="Vitórias"
                        className="cursor-help no-underline sm:hidden"
                      >
                        V
                      </abbr>
                      <span className="hidden sm:inline">Vitórias</span>
                    </th>
                    <th className="pb-2 pr-0 text-right font-medium opacity-60 sm:pb-3 sm:pr-2">
                      <abbr
                        title="Derrotas"
                        className="cursor-help no-underline sm:hidden"
                      >
                        D
                      </abbr>
                      <span className="hidden sm:inline">Derrotas</span>
                    </th>
                    <th className="pb-2 text-right font-medium opacity-60 sm:pb-3">
                      <abbr
                        title="Partidas"
                        className="cursor-help no-underline sm:hidden"
                      >
                        P
                      </abbr>
                      <span className="hidden sm:inline">Partidas</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((row, i) => (
                    <tr key={row.key} className="border-b border-black/10 last:border-0">
                      <td className="py-2 pr-1 align-middle opacity-60 sm:py-3 sm:pr-2">
                        {i + 1}
                      </td>
                      <td className="max-w-0 py-2 pr-1 align-middle font-medium sm:py-3 sm:pr-3">
                        <span className="block truncate" title={row.displayName}>
                          {row.displayName}
                        </span>
                      </td>
                      <td className="py-2 pr-0 text-right tabular-nums align-middle sm:py-3 sm:pr-2">
                        {row.wins}
                      </td>
                      <td className="py-2 pr-0 text-right tabular-nums align-middle sm:py-3 sm:pr-2">
                        {row.losses}
                      </td>
                      <td className="py-2 text-right tabular-nums align-middle sm:py-3">
                        {row.matches}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="border-3 p-4 sm:p-6">
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
