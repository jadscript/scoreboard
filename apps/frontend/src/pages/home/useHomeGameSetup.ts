import { useEffect, useMemo, useState } from 'react'
import type {
  GameFormat,
  GamesPerSetOption,
  MatchFlowType,
  MatchGenderOption,
  MatchSetsOption,
} from './types'
import { loadGameSetup, patchGameSetup } from './gameSetupStorage'

export function useHomeGameSetup() {
  const initial = useMemo(() => loadGameSetup(), [])

  const [matchFlowType, setMatchFlowType] = useState<MatchFlowType>(
    () => initial.matchFlowType,
  )
  const [gameFormat, setGameFormat] = useState<GameFormat>(
    () => initial.gameFormat,
  )
  const [matchGender, setMatchGender] = useState<MatchGenderOption>(
    () => initial.matchGender,
  )
  const [gamesPerSet, setGamesPerSet] = useState<GamesPerSetOption>(
    () => initial.gamesPerSet,
  )
  const [matchSets, setMatchSets] = useState<MatchSetsOption>(
    () => initial.matchSets,
  )

  useEffect(() => {
    patchGameSetup({
      matchFlowType,
      gameFormat,
      matchGender,
      gamesPerSet,
      matchSets,
    })
  }, [
    matchFlowType,
    gameFormat,
    matchGender,
    gamesPerSet,
    matchSets,
  ])

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
  }
}
