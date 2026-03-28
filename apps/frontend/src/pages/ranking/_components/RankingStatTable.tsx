import type { RankingRow } from "../rankingStats";

interface Props {
  title: string;
  emptyMessage: string;
  rows: RankingRow[];
  /** Cabeçalho da coluna de nome no desktop (ex.: Jogador, Time). */
  nameColumnFull: string;
  /** Uma letra no mobile (ex.: J, T). */
  nameColumnAbbr: string;
  titleAttrForAbbr: string;
}

export function RankingStatTable({
  title,
  emptyMessage,
  rows,
  nameColumnFull,
  nameColumnAbbr,
  titleAttrForAbbr,
}: Props) {
  return (
    <section className="border-3 min-w-0 p-4 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm opacity-60">{emptyMessage}</p>
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
                    title={titleAttrForAbbr}
                    className="cursor-help no-underline sm:hidden"
                  >
                    {nameColumnAbbr}
                  </abbr>
                  <span className="hidden sm:inline">{nameColumnFull}</span>
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
              {rows.map((row, i) => (
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
  );
}
