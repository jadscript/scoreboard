import { useEffect, useState } from 'react';

import type {
  GameFormat,
  GamesPerSetOption,
  MatchFlowType,
  MatchGenderOption,
  MatchSetsOption,
} from './types';
import { getDefaultGameSetup, loadGameSetup, patchGameSetup } from './gameSetupStorage';

export function useHomeGameSetup() {
  const defaults = getDefaultGameSetup();
  const [hydrated, setHydrated] = useState(false);
  const [matchFlowType, setMatchFlowType] = useState<MatchFlowType>(
    () => defaults.matchFlowType,
  );
  const [gameFormat, setGameFormat] = useState<GameFormat>(() => defaults.gameFormat);
  const [matchGender, setMatchGender] = useState<MatchGenderOption>(
    () => defaults.matchGender,
  );
  const [gamesPerSet, setGamesPerSet] = useState<GamesPerSetOption>(
    () => defaults.gamesPerSet,
  );
  const [matchSets, setMatchSets] = useState<MatchSetsOption>(() => defaults.matchSets);

  useEffect(() => {
    let cancelled = false;
    void loadGameSetup().then((loaded) => {
      if (cancelled) return;
      setMatchFlowType(loaded.matchFlowType);
      setGameFormat(loaded.gameFormat);
      setMatchGender(loaded.matchGender);
      setGamesPerSet(loaded.gamesPerSet);
      setMatchSets(loaded.matchSets);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void patchGameSetup({
      matchFlowType,
      gameFormat,
      matchGender,
      gamesPerSet,
      matchSets,
    });
  }, [hydrated, matchFlowType, gameFormat, matchGender, gamesPerSet, matchSets]);

  return {
    matchFlowType,
    setMatchFlowType,
    gameFormat,
    setGameFormat,
    matchGender,
    setMatchGender,
    gamesPerSet,
    setGamesPerSet,
    matchSets,
    setMatchSets,
  };
}
