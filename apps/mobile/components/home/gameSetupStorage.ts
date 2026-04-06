import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  GameFormat,
  GamesPerSetOption,
  MatchFlowType,
  MatchGenderOption,
  MatchSetsOption,
  TeamDraft,
} from './types';
import { playersPerTeamForFormat } from './types';

const STORAGE_KEY = 'scoreboard/game-setup';
const PERSIST_VERSION = 1;
export const MIN_TEAMS = 2;
const MAX_TEAMS = 24;

export interface PersistedGameSetup {
  gameFormat: GameFormat;
  gamesPerSet: GamesPerSetOption;
  matchSets: MatchSetsOption;
  teams: TeamDraft[];
  matchGender: MatchGenderOption;
  matchFlowType: MatchFlowType;
}

function newTeamId(): string {
  return globalThis.crypto.randomUUID();
}

export function emptyTeam(players: number): TeamDraft {
  return {
    id: newTeamId(),
    playerNames: Array.from({ length: players }, () => ''),
  };
}

export function resizeNames(names: string[], len: number): string[] {
  const next = names.slice(0, len);
  while (next.length < len) next.push('');
  return next;
}

export function getDefaultGameSetup(): PersistedGameSetup {
  return {
    gameFormat: 'doubles',
    gamesPerSet: 6,
    matchSets: 2,
    teams: [emptyTeam(2), emptyTeam(2)],
    matchGender: 'mixed',
    matchFlowType: 'new',
  };
}

function isGameFormat(x: unknown): x is GameFormat {
  return x === 'singles' || x === 'doubles';
}

function isGamesPerSetOption(x: unknown): x is GamesPerSetOption {
  return x === 2 || x === 3 || x === 4 || x === 5 || x === 6;
}

function isMatchSetsOption(x: unknown): x is MatchSetsOption {
  return x === 1 || x === 2 || x === 3;
}

function isMatchGenderOption(x: unknown): x is MatchGenderOption {
  return x === 'male' || x === 'female' || x === 'mixed';
}

function isMatchFlowType(x: unknown): x is MatchFlowType {
  return x === 'new' || x === 'join';
}

function parseTeam(raw: unknown): TeamDraft | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'string' || o.id.length === 0) return null;
  if (!Array.isArray(o.playerNames)) return null;
  const playerNames = o.playerNames.map((n) =>
    typeof n === 'string' ? n.slice(0, 80) : '',
  );
  return { id: o.id, playerNames };
}

function normalizeSetup(raw: unknown): PersistedGameSetup {
  const fallback = getDefaultGameSetup();
  if (typeof raw !== 'object' || raw === null) return fallback;
  const o = raw as Record<string, unknown>;
  if (o.v !== PERSIST_VERSION) return fallback;

  const gameFormat = isGameFormat(o.gameFormat) ? o.gameFormat : fallback.gameFormat;
  const gamesPerSet = isGamesPerSetOption(o.gamesPerSet) ? o.gamesPerSet : fallback.gamesPerSet;
  const matchSets = isMatchSetsOption(o.matchSets) ? o.matchSets : fallback.matchSets;
  const matchGender = isMatchGenderOption(o.matchGender)
    ? o.matchGender
    : fallback.matchGender;
  const matchFlowType = isMatchFlowType(o.matchFlowType)
    ? o.matchFlowType
    : fallback.matchFlowType;

  const n = playersPerTeamForFormat(gameFormat);
  let teams: TeamDraft[] = fallback.teams;

  if (Array.isArray(o.teams)) {
    const parsed = o.teams.map(parseTeam).filter((t): t is TeamDraft => t !== null);
    if (parsed.length >= MIN_TEAMS) {
      teams = parsed.slice(0, MAX_TEAMS).map((t) => ({
        id: t.id,
        playerNames: resizeNames(t.playerNames, n),
      }));
    }
  }

  return { gameFormat, gamesPerSet, matchSets, teams, matchGender, matchFlowType };
}

export async function loadGameSetup(): Promise<PersistedGameSetup> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === '') return getDefaultGameSetup();
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== 'object' || data === null) return getDefaultGameSetup();
    const o = data as Record<string, unknown>;
    if (o.v !== PERSIST_VERSION) return getDefaultGameSetup();
    return normalizeSetup(o);
  } catch {
    return getDefaultGameSetup();
  }
}

export async function saveGameSetup(setup: PersistedGameSetup): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        v: PERSIST_VERSION,
        gameFormat: setup.gameFormat,
        gamesPerSet: setup.gamesPerSet,
        matchSets: setup.matchSets,
        teams: setup.teams,
        matchGender: setup.matchGender,
        matchFlowType: setup.matchFlowType,
      }),
    );
  } catch {
    /* quota */
  }
}

export async function patchGameSetup(partial: Partial<PersistedGameSetup>): Promise<void> {
  const current = await loadGameSetup();
  await saveGameSetup({ ...current, ...partial });
}
