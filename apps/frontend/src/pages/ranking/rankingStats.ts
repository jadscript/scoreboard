import type { SavedMatchRecord } from "../scoreboard/matchHistoryStorage";
import { normalizePlayerKey } from "../game/playerSelection";

/** Linha de ranking (time ou jogador): vitórias, derrotas e partidas disputadas. */
export interface RankingRow {
  /** Chave estável para agrupar (nome em minúsculas). */
  key: string;
  displayName: string;
  wins: number;
  losses: number;
  /** Partidas disputadas. */
  matches: number;
}

export type TeamRankingRow = RankingRow;

/** Nomes de jogadores a partir do rótulo do time (ex.: "A / B" → ["A","B"]). */
function playersFromTeamDisplay(teamName: string): string[] {
  const raw = teamName.trim();
  if (!raw) return ["Time"];
  const parts = raw
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts : [raw];
}

/**
 * Agrega vitórias / derrotas / partidas por jogador.
 * Cada nome no time (separado por " / ") conta como um jogador; vitória/derrota do time replica para todos.
 */
export function buildPlayerRanking(matches: SavedMatchRecord[]): RankingRow[] {
  const map = new Map<
    string,
    { displayName: string; wins: number; losses: number; matches: number }
  >();

  for (const m of matches) {
    const s1 = m.finalSets.team1;
    const s2 = m.finalSets.team2;
    const team1Won = s1 > s2;
    const team2Won = s2 > s1;

    const applySide = (
      teamName: string,
      sideWon: boolean,
      sideLost: boolean,
    ) => {
      for (const name of playersFromTeamDisplay(teamName)) {
        const k = normalizePlayerKey(name);
        if (!k) continue;
        if (!map.has(k)) {
          map.set(k, {
            displayName: name.trim(),
            wins: 0,
            losses: 0,
            matches: 0,
          });
        }
        const row = map.get(k)!;
        row.matches += 1;
        if (sideWon) row.wins += 1;
        if (sideLost) row.losses += 1;
      }
    };

    applySide(m.team1Name, team1Won, team2Won);
    applySide(m.team2Name, team2Won, team1Won);
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

/**
 * Agrega vitórias / derrotas / partidas por nome de time a partir das partidas salvas.
 * Nomes iguais ignorando maiúsculas são tratados como o mesmo time.
 */
export function buildTeamRanking(matches: SavedMatchRecord[]): RankingRow[] {
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
