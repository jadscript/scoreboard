import type { SavedMatchRecord } from "../scoreboard/matchHistoryStorage";

export interface TeamRankingRow {
  /** Chave estável para agrupar (nome em minúsculas). */
  key: string;
  displayName: string;
  wins: number;
  losses: number;
  /** Partidas disputadas (entradas no histórico em que o time participou). */
  matches: number;
}

/**
 * Agrega vitórias / derrotas / partidas por nome de time a partir das partidas salvas.
 * Nomes iguais ignorando maiúsculas são tratados como o mesmo time.
 */
export function buildTeamRanking(matches: SavedMatchRecord[]): TeamRankingRow[] {
  const map = new Map<
    string,
    { displayName: string; wins: number; losses: number; matches: number }
  >();

  for (const m of matches) {
    const raw1 = m.team1Name.trim() || "Time 1";
    const raw2 = m.team2Name.trim() || "Time 2";
    const k1 = raw1.toLowerCase();
    const k2 = raw2.toLowerCase();

    if (!map.has(k1)) {
      map.set(k1, { displayName: raw1, wins: 0, losses: 0, matches: 0 });
    }
    if (!map.has(k2)) {
      map.set(k2, { displayName: raw2, wins: 0, losses: 0, matches: 0 });
    }

    const t1 = map.get(k1)!;
    const t2 = map.get(k2)!;
    t1.matches += 1;
    t2.matches += 1;

    const s1 = m.finalSets.team1;
    const s2 = m.finalSets.team2;
    if (s1 > s2) {
      t1.wins += 1;
      t2.losses += 1;
    } else if (s2 > s1) {
      t2.wins += 1;
      t1.losses += 1;
    }
  }

  return Array.from(map.entries())
    .map(([key, v]) => ({
      key,
      displayName: v.displayName,
      wins: v.wins,
      losses: v.losses,
      matches: v.matches,
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return a.displayName.localeCompare(b.displayName, "pt");
    });
}
