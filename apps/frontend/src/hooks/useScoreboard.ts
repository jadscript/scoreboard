import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { buildPointEventsFromHistory } from '../pages/scoreboard/matchHistoryStorage'
import { loadGameSetup } from '../pages/home/gameSetupStorage'

const SCORE_KEY = 's'
const TEAM1_KEY = '1'
const TEAM2_KEY = '2'
const DOUBLE_CLICK_THRESHOLD_MS = 300
const HOLD_DURATION_MS = 3000

// Beach tennis official rule: no advantage at deuce, next point wins the game
const NO_AD = true

type Team = 'team1' | 'team2'
type Score = { team1: number; team2: number }

export interface Snapshot {
  points: Score
  games: Score
  sets: Score
  isTiebreak: boolean
  setHistory: Score[]
}

interface State extends Snapshot {
  history: Snapshot[]
  team1Name: string
  team2Name: string
  /** Games no set para vencer (2 a 6). */
  gamesToWinSet: 2 | 3 | 4 | 5 | 6
  /** Quantos sets um time precisa vencer para fechar a partida. */
  setsToWinMatch: number
  matchFinished: boolean
}

type Action =
  | { type: 'SCORE'; team: Team }
  | { type: 'UNDO' }
  | {
      type: 'RESET'
      gamesToWinSet: 2 | 3 | 4 | 5 | 6
      setsToWinMatch: number
    }
  | { type: 'SET_TEAM_NAME'; team: Team; name: string }

const ZERO: Score = { team1: 0, team2: 0 }

const INITIAL_SNAPSHOT: Snapshot = {
  points: ZERO,
  games: ZERO,
  sets: ZERO,
  isTiebreak: false,
  setHistory: [],
}

const INITIAL_STATE: State = {
  ...INITIAL_SNAPSHOT,
  history: [],
  team1Name: 'Time 1',
  team2Name: 'Time 2',
  gamesToWinSet: 6,
  setsToWinMatch: 2,
  matchFinished: false,
}

const STORAGE_KEY = 'scoreboard/match-state'
const PERSIST_VERSION = 2
const TEAM_NAME_MAX_LEN = 40
const PERSIST_DEBOUNCE_MS = 250

function clampTeamName(name: string, fallback: string): string {
  const t = name.trim().slice(0, TEAM_NAME_MAX_LEN)
  return t.length > 0 ? t : fallback
}

function isFiniteNonNegInt(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0 && Math.floor(n) === n
}

function isScore(x: unknown): x is Score {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return isFiniteNonNegInt(o.team1) && isFiniteNonNegInt(o.team2)
}

function isSnapshotValue(x: unknown): x is Snapshot {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    isScore(o.points) &&
    isScore(o.games) &&
    isScore(o.sets) &&
    typeof o.isTiebreak === 'boolean' &&
    Array.isArray(o.setHistory) &&
    o.setHistory.every(isScore)
  )
}

function isPersistedStateBody(x: unknown): x is Omit<State, 'gamesToWinSet' | 'setsToWinMatch' | 'matchFinished'> & {
  gamesToWinSet?: unknown
  setsToWinMatch?: unknown
  matchFinished?: unknown
} {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  if (!isScore(o.points) || !isScore(o.games) || !isScore(o.sets)) return false
  if (typeof o.isTiebreak !== 'boolean') return false
  if (!Array.isArray(o.setHistory) || !o.setHistory.every(isScore)) return false
  if (!Array.isArray(o.history) || !o.history.every(isSnapshotValue)) return false
  if (typeof o.team1Name !== 'string' || typeof o.team2Name !== 'string') return false
  return true
}

function normalizeGamesToWinSet(v: unknown): 2 | 3 | 4 | 5 | 6 {
  if (v === 2 || v === 3 || v === 4 || v === 5 || v === 6) return v
  return 6
}

function normalizeSetsToWinMatch(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v) && v >= 1 && v <= 3 && Math.floor(v) === v) {
    return v
  }
  return 2
}

function normalizeMatchFinished(v: unknown): boolean {
  return v === true
}

function parseStoredState(raw: string | null): State | null {
  if (raw === null || raw === '') return null
  try {
    const data = JSON.parse(raw) as unknown
    if (typeof data !== 'object' || data === null) return null
    const o = data as Record<string, unknown>
    if (o.v !== 1 && o.v !== PERSIST_VERSION) return null
    const body = { ...o }
    delete body.v
    if (!isPersistedStateBody(body)) return null
    return {
      points: body.points,
      games: body.games,
      sets: body.sets,
      isTiebreak: body.isTiebreak,
      setHistory: body.setHistory,
      history: body.history,
      team1Name: clampTeamName(body.team1Name, 'Time 1'),
      team2Name: clampTeamName(body.team2Name, 'Time 2'),
      gamesToWinSet: normalizeGamesToWinSet(body.gamesToWinSet),
      setsToWinMatch: normalizeSetsToWinMatch(body.setsToWinMatch),
      matchFinished: normalizeMatchFinished(body.matchFinished),
    }
  } catch {
    return null
  }
}

function serializeState(state: State): string {
  return JSON.stringify({
    v: PERSIST_VERSION,
    points: state.points,
    games: state.games,
    sets: state.sets,
    isTiebreak: state.isTiebreak,
    setHistory: state.setHistory,
    history: state.history,
    team1Name: state.team1Name,
    team2Name: state.team2Name,
    gamesToWinSet: state.gamesToWinSet,
    setsToWinMatch: state.setsToWinMatch,
    matchFinished: state.matchFinished,
  })
}

/** Aplica games/set da configuração salva (página de jogo) sobre o estado do placar. */
function applySavedGameSetup(state: State): State {
  const setup = loadGameSetup()
  return {
    ...state,
    gamesToWinSet: normalizeGamesToWinSet(setup.gamesPerSet),
    setsToWinMatch: normalizeSetsToWinMatch(setup.matchSets),
  }
}

function readInitialState(): State {
  if (typeof globalThis === 'undefined' || typeof globalThis.localStorage === 'undefined') {
    return applySavedGameSetup(INITIAL_STATE)
  }
  const parsed = parseStoredState(globalThis.localStorage.getItem(STORAGE_KEY))
  return applySavedGameSetup(parsed ?? INITIAL_STATE)
}

function isEditableKeyTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable
}

function matchesScoreKey(e: KeyboardEvent): boolean {
  return e.key.toLowerCase() === SCORE_KEY
}

function gameWinner(points: Score, isTiebreak: boolean): Team | null {
  const { team1, team2 } = points

  if (isTiebreak) {
    if (team1 >= 7 && team1 - team2 >= 2) return 'team1'
    if (team2 >= 7 && team2 - team1 >= 2) return 'team2'
    return null
  }

  if (NO_AD) {
    // At 40-40 (3-3), next point wins
    if (team1 >= 4 && team1 > team2) return 'team1'
    if (team2 >= 4 && team2 > team1) return 'team2'
    return null
  }

  // Standard: min 4 points, win by 2
  if (team1 >= 4 && team1 - team2 >= 2) return 'team1'
  if (team2 >= 4 && team2 - team1 >= 2) return 'team2'
  return null
}

function setWinner(games: Score, gamesToWin: number): Team | null {
  const { team1, team2 } = games

  if (team1 >= gamesToWin && team1 - team2 >= 2) return 'team1'
  if (team2 >= gamesToWin && team2 - team1 >= 2) return 'team2'

  if (team1 === gamesToWin + 1 && team2 === gamesToWin) return 'team1'
  if (team2 === gamesToWin + 1 && team1 === gamesToWin) return 'team2'

  return null
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESET':
      return {
        ...INITIAL_STATE,
        team1Name: state.team1Name,
        team2Name: state.team2Name,
        gamesToWinSet: action.gamesToWinSet,
        setsToWinMatch: normalizeSetsToWinMatch(action.setsToWinMatch),
      }

    case 'SET_TEAM_NAME': {
      const key = action.team === 'team1' ? 'team1Name' : 'team2Name'
      return {
        ...state,
        [key]: action.name.slice(0, TEAM_NAME_MAX_LEN),
      }
    }

    case 'UNDO': {
      if (state.history.length === 0) return state
      const prev = state.history[state.history.length - 1]
      return {
        ...prev,
        history: state.history.slice(0, -1),
        team1Name: state.team1Name,
        team2Name: state.team2Name,
        gamesToWinSet: state.gamesToWinSet,
        setsToWinMatch: state.setsToWinMatch,
        matchFinished: false,
      }
    }

    case 'SCORE': {
      if (state.matchFinished) return state

      const snapshot: Snapshot = {
        points: state.points,
        games: state.games,
        sets: state.sets,
        isTiebreak: state.isTiebreak,
        setHistory: state.setHistory,
      }

      const newPoints: Score = {
        ...state.points,
        [action.team]: state.points[action.team] + 1,
      }

      const winner = gameWinner(newPoints, state.isTiebreak)

      if (!winner) {
        return { ...state, points: newPoints, history: [...state.history, snapshot] }
      }

      // Game won — add 1 to the winner's game count
      const newGames: Score = { ...state.games, [winner]: state.games[winner] + 1 }
      const gtw = state.gamesToWinSet
      const wonSet = setWinner(newGames, gtw)

      if (wonSet) {
        const newSets: Score = { ...state.sets, [wonSet]: state.sets[wonSet] + 1 }
        const matchFinished =
          newSets.team1 >= state.setsToWinMatch || newSets.team2 >= state.setsToWinMatch
        return {
          points: { ...ZERO },
          games: { ...ZERO },
          sets: newSets,
          isTiebreak: false,
          setHistory: [...state.setHistory, newGames],
          history: [...state.history, snapshot],
          team1Name: state.team1Name,
          team2Name: state.team2Name,
          gamesToWinSet: state.gamesToWinSet,
          setsToWinMatch: state.setsToWinMatch,
          matchFinished,
        }
      }

      const isTiebreak = newGames.team1 === gtw && newGames.team2 === gtw

      return {
        points: { ...ZERO },
        games: newGames,
        sets: state.sets,
        isTiebreak,
        setHistory: state.setHistory,
        history: [...state.history, snapshot],
        team1Name: state.team1Name,
        team2Name: state.team2Name,
        gamesToWinSet: state.gamesToWinSet,
        setsToWinMatch: state.setsToWinMatch,
        matchFinished: state.matchFinished,
      }
    }
  }
}

const POINT_LABELS = ['0', '15', '30', '40'] as const

function displayTeamName(team: Team, names: Pick<State, 'team1Name' | 'team2Name'>): string {
  const raw = team === 'team1' ? names.team1Name : names.team2Name
  const t = raw.trim()
  if (t.length > 0) return t
  return team === 'team1' ? 'Time 1' : 'Time 2'
}

function describeLastScoringAction(
  prior: Snapshot,
  current: Snapshot,
  names: Pick<State, 'team1Name' | 'team2Name'>,
): string {
  if (current.setHistory.length > prior.setHistory.length) {
    const finalGames = current.setHistory[current.setHistory.length - 1]
    const winner: Team = finalGames.team1 > finalGames.team2 ? 'team1' : 'team2'
    const setNum = current.setHistory.length
    return `Fim do set ${setNum} (${finalGames.team1}–${finalGames.team2}), vitória de ${displayTeamName(winner, names)}`
  }

  if (current.games.team1 !== prior.games.team1 || current.games.team2 !== prior.games.team2) {
    if (current.isTiebreak && !prior.isTiebreak) {
      return 'Game que equalizou em 6–6 e início do tie-break'
    }
    const t1Delta = current.games.team1 - prior.games.team1
    const winner: Team = t1Delta > 0 ? 'team1' : 'team2'
    return `Game para ${displayTeamName(winner, names)} (games ${current.games.team1}–${current.games.team2})`
  }

  if (current.points.team1 !== prior.points.team1) {
    if (current.isTiebreak) {
      return `Ponto para ${displayTeamName('team1', names)} no tie-break (${current.points.team1}–${current.points.team2})`
    }
    return `Ponto para ${displayTeamName('team1', names)}`
  }
  if (current.points.team2 !== prior.points.team2) {
    if (current.isTiebreak) {
      return `Ponto para ${displayTeamName('team2', names)} no tie-break (${current.points.team1}–${current.points.team2})`
    }
    return `Ponto para ${displayTeamName('team2', names)}`
  }

  return 'Última alteração no placar'
}

export function useScoreboard(options?: {
  onScore?: (team: Team) => void
  onAfterUndo?: () => void
  onAfterScore?: (payload: { team: Team; priorSnapshot: Snapshot }) => void
}) {
  const [state, dispatch] = useReducer(reducer, undefined, readInitialState)
  const onScoreRef = useRef(options?.onScore)
  const onAfterUndoRef = useRef(options?.onAfterUndo)
  const onAfterScoreRef = useRef(options?.onAfterScore)
  const stateForPersistRef = useRef(state)

  useEffect(() => {
    stateForPersistRef.current = state
  }, [state])

  useEffect(() => {
    onScoreRef.current = options?.onScore
    onAfterUndoRef.current = options?.onAfterUndo
    onAfterScoreRef.current = options?.onAfterScore
  })

  useEffect(() => {
    if (typeof globalThis.localStorage === 'undefined') return
    const id = globalThis.setTimeout(() => {
      try {
        globalThis.localStorage.setItem(STORAGE_KEY, serializeState(stateForPersistRef.current))
      } catch {
        /* quota, private mode */
      }
    }, PERSIST_DEBOUNCE_MS)
    return () => {
      globalThis.clearTimeout(id)
    }
  }, [state])

  useEffect(() => {
    return () => {
      if (typeof globalThis.localStorage === 'undefined') return
      try {
        globalThis.localStorage.setItem(STORAGE_KEY, serializeState(stateForPersistRef.current))
      } catch {
        /* quota, private mode */
      }
    }
  }, [])

  const handleScore = useCallback((team: Team) => {
    const prior = stateForPersistRef.current
    if (prior.matchFinished) return
    const priorSnapshot: Snapshot = {
      points: { ...prior.points },
      games: { ...prior.games },
      sets: { ...prior.sets },
      isTiebreak: prior.isTiebreak,
      setHistory: [...prior.setHistory],
    }
    dispatch({ type: 'SCORE', team })
    onScoreRef.current?.(team)
    onAfterScoreRef.current?.({ team, priorSnapshot })
  }, [])

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' })
    onAfterUndoRef.current?.()
  }, [])

  const handleReset = useCallback(() => {
    const setup = loadGameSetup()
    dispatch({
      type: 'RESET',
      gamesToWinSet: setup.gamesPerSet,
      setsToWinMatch: setup.matchSets,
    })
  }, [])

  const setTeamName = useCallback((team: Team, name: string) => {
    dispatch({ type: 'SET_TEAM_NAME', team, name })
  }, [])

  const lastKeyUpRef = useRef<number | null>(null)
  const scoreKeyHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const singleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scoreKeyDidHoldRef = useRef(false)

  const teamHoldTimerRef = useRef<Partial<Record<Team, ReturnType<typeof setTimeout>>>>({})
  const teamDidHoldRef = useRef<Partial<Record<Team, boolean>>>({})

  useEffect(() => {
    const TEAM_KEY_MAP: Record<string, Team> = {
      [TEAM1_KEY]: 'team1',
      [TEAM2_KEY]: 'team2',
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (isEditableKeyTarget(e.target)) return

      const team = TEAM_KEY_MAP[e.key]
      if (team) {
        teamDidHoldRef.current[team] = false
        teamHoldTimerRef.current[team] = setTimeout(() => {
          teamDidHoldRef.current[team] = true
          handleUndo()
        }, HOLD_DURATION_MS)
        return
      }

      if (!matchesScoreKey(e)) return

      scoreKeyDidHoldRef.current = false
      scoreKeyHoldTimerRef.current = setTimeout(() => {
        scoreKeyDidHoldRef.current = true
        handleUndo()
      }, HOLD_DURATION_MS)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (isEditableKeyTarget(e.target)) return

      const team = TEAM_KEY_MAP[e.key]
      if (team) {
        const timer = teamHoldTimerRef.current[team]
        if (timer) {
          clearTimeout(timer)
          delete teamHoldTimerRef.current[team]
        }
        if (teamDidHoldRef.current[team]) {
          teamDidHoldRef.current[team] = false
          return
        }
        handleScore(team)
        return
      }

      if (!matchesScoreKey(e)) return

      if (scoreKeyHoldTimerRef.current) {
        clearTimeout(scoreKeyHoldTimerRef.current)
        scoreKeyHoldTimerRef.current = null
      }

      if (scoreKeyDidHoldRef.current) {
        scoreKeyDidHoldRef.current = false
        return
      }

      const now = Date.now()
      const last = lastKeyUpRef.current

      if (last !== null && now - last < DOUBLE_CLICK_THRESHOLD_MS) {
        if (singleClickTimerRef.current) {
          clearTimeout(singleClickTimerRef.current)
          singleClickTimerRef.current = null
        }
        lastKeyUpRef.current = null
        handleScore('team2')
      } else {
        lastKeyUpRef.current = now
        singleClickTimerRef.current = setTimeout(() => {
          if (lastKeyUpRef.current === now) {
            lastKeyUpRef.current = null
            handleScore('team1')
          }
          singleClickTimerRef.current = null
        }, DOUBLE_CLICK_THRESHOLD_MS)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (scoreKeyHoldTimerRef.current) clearTimeout(scoreKeyHoldTimerRef.current)
      if (singleClickTimerRef.current) clearTimeout(singleClickTimerRef.current)
      Object.values(teamHoldTimerRef.current).forEach(clearTimeout)
    }
  }, [handleScore, handleUndo])

  const pointDisplay = useMemo((): { team1: string; team2: string } => {
    const { points, isTiebreak } = state

    if (isTiebreak) {
      return { team1: String(points.team1), team2: String(points.team2) }
    }

    const { team1, team2 } = points

    // noAd deuce: show 40-40, next point decides
    if (NO_AD && team1 >= 3 && team2 >= 3) {
      return { team1: '40', team2: '40' }
    }

    return {
      team1: POINT_LABELS[Math.min(team1, 3)],
      team2: POINT_LABELS[Math.min(team2, 3)],
    }
  }, [state])

  const isDeuce = useMemo(
    () => !state.isTiebreak && state.points.team1 >= 3 && state.points.team1 === state.points.team2,
    [state],
  )

  // Even total games in the current set → team1 serves first; odd → team2 serves
  const serving = useMemo((): Team => {
    const totalGames = state.games.team1 + state.games.team2
    return totalGames % 2 === 1 ? 'team2' : 'team1'
  }, [state.games])

  // Beach tennis court-switching rule: teams switch ends after the 1st game,
  // then after every 2 games (total 1, 2, 5, 6, 9, 10 …).
  // Formula: switched when floor((total + 1) / 2) is odd.
  const courtSwitched = useMemo((): boolean => {
    const totalGames = state.games.team1 + state.games.team2
    return Math.floor((totalGames + 1) / 2) % 2 === 1
  }, [state.games])

  const canUndo = state.history.length > 0
  const canReset = state.history.length > 0

  const pointEvents = useMemo(() => {
    const current: Snapshot = {
      points: state.points,
      games: state.games,
      sets: state.sets,
      isTiebreak: state.isTiebreak,
      setHistory: state.setHistory,
    }
    return buildPointEventsFromHistory(state.history, current)
  }, [state])

  const undoActionDescription = useMemo((): string | null => {
    if (state.history.length === 0) return null
    const prior = state.history[state.history.length - 1]
    const current: Snapshot = {
      points: state.points,
      games: state.games,
      sets: state.sets,
      isTiebreak: state.isTiebreak,
      setHistory: state.setHistory,
    }
    return describeLastScoringAction(prior, current, {
      team1Name: state.team1Name,
      team2Name: state.team2Name,
    })
  }, [state])

  const invertTeams = useCallback(() => {
    const temp = state.team1Name;
    dispatch({ type: 'SET_TEAM_NAME', team: 'team1', name: state.team2Name });
    dispatch({ type: 'SET_TEAM_NAME', team: 'team2', name: temp });
  }, [state.team1Name, state.team2Name]);

  const handleInvertTeams = useCallback(() => {
    const setup = loadGameSetup()
    dispatch({
      type: 'RESET',
      gamesToWinSet: setup.gamesPerSet,
      setsToWinMatch: setup.matchSets,
    })
    invertTeams()
  }, [invertTeams])

  return {
    points: state.points,
    games: state.games,
    sets: state.sets,
    gamesToWinSet: state.gamesToWinSet,
    setsToWinMatch: state.setsToWinMatch,
    setHistory: state.setHistory,
    pointEvents,
    isTiebreak: state.isTiebreak,
    serving,
    courtSwitched,
    team1Score: pointDisplay.team1,
    team2Score: pointDisplay.team2,
    isDeuce,
    matchFinished: state.matchFinished,
    handleScore,
    handleUndo,
    handleReset,
    canUndo,
    canReset,
    undoActionDescription,
    team1Name: state.team1Name,
    team2Name: state.team2Name,
    setTeamName,
    handleInvertTeams,
  }
}

export type { Team as ScoreboardTeam }

export function bootstrapScoreboardMatch(input: {
  team1Name: string
  team2Name: string
  gamesToWinSet: 2 | 3 | 4 | 5 | 6
  setsToWinMatch: number
}): void {
  if (typeof globalThis.localStorage === 'undefined') return
  const state: State = {
    ...INITIAL_SNAPSHOT,
    history: [],
    team1Name: clampTeamName(input.team1Name, 'Time 1'),
    team2Name: clampTeamName(input.team2Name, 'Time 2'),
    gamesToWinSet: input.gamesToWinSet,
    setsToWinMatch: normalizeSetsToWinMatch(input.setsToWinMatch),
    matchFinished: false,
  }
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, serializeState(state))
  } catch {
    /* quota, private mode */
  }
}
