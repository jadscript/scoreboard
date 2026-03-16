import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

const SCORE_KEY = ' '
const DOUBLE_CLICK_THRESHOLD_MS = 300
const HOLD_DURATION_MS = 3000

// Beach tennis official rule: no advantage at deuce, next point wins the game
const NO_AD = true

type Team = 'team1' | 'team2'
type Score = { team1: number; team2: number }

interface Snapshot {
  points: Score
  games: Score
  sets: Score
  isTiebreak: boolean
  setHistory: Score[]
}

interface State extends Snapshot {
  history: Snapshot[]
}

type Action =
  | { type: 'SCORE'; team: Team }
  | { type: 'UNDO' }
  | { type: 'RESET' }

const ZERO: Score = { team1: 0, team2: 0 }

const INITIAL_SNAPSHOT: Snapshot = {
  points: ZERO,
  games: ZERO,
  sets: ZERO,
  isTiebreak: false,
  setHistory: [],
}

const INITIAL_STATE: State = { ...INITIAL_SNAPSHOT, history: [] }

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

function setWinner(games: Score): Team | null {
  const { team1, team2 } = games

  // First to 6, win by 2 (covers 6-0 through 6-4 and 7-5)
  if (team1 >= 6 && team1 - team2 >= 2) return 'team1'
  if (team2 >= 6 && team2 - team1 >= 2) return 'team2'

  // After tie-break: 7-6
  if (team1 === 7 && team2 === 6) return 'team1'
  if (team2 === 7 && team1 === 6) return 'team2'

  return null
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESET':
      return INITIAL_STATE

    case 'UNDO': {
      if (state.history.length === 0) return state
      const prev = state.history[state.history.length - 1]
      return { ...prev, history: state.history.slice(0, -1) }
    }

    case 'SCORE': {
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
      const wonSet = setWinner(newGames)

      if (wonSet) {
        return {
          points: { ...ZERO },
          games: { ...ZERO },
          sets: { ...state.sets, [wonSet]: state.sets[wonSet] + 1 },
          isTiebreak: false,
          setHistory: [...state.setHistory, newGames],
          history: [...state.history, snapshot],
        }
      }

      // At 6-6 the next game is a tie-break
      const isTiebreak = newGames.team1 === 6 && newGames.team2 === 6

      return {
        points: { ...ZERO },
        games: newGames,
        sets: state.sets,
        isTiebreak,
        setHistory: state.setHistory,
        history: [...state.history, snapshot],
      }
    }
  }
}

const POINT_LABELS = ['0', '15', '30', '40'] as const

export function useScoreboard() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const handleScore = useCallback((team: Team) => {
    dispatch({ type: 'SCORE', team })
  }, [])

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const lastKeyUpRef = useRef<number | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const singleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didHoldRef = useRef(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== SCORE_KEY || e.repeat) return

      didHoldRef.current = false

      holdTimerRef.current = setTimeout(() => {
        didHoldRef.current = true
        handleUndo()
      }, HOLD_DURATION_MS)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== SCORE_KEY) return

      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
        holdTimerRef.current = null
      }

      if (didHoldRef.current) {
        didHoldRef.current = false
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
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (singleClickTimerRef.current) clearTimeout(singleClickTimerRef.current)
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

  // Odd total games in the current set → team1 serves; even → team2 serves
  const serving = useMemo((): Team => {
    const totalGames = state.games.team1 + state.games.team2
    return totalGames % 2 === 1 ? 'team2' : 'team1'
  }, [state.games])

  return {
    points: state.points,
    games: state.games,
    sets: state.sets,
    setHistory: state.setHistory,
    isTiebreak: state.isTiebreak,
    serving,
    team1Score: pointDisplay.team1,
    team2Score: pointDisplay.team2,
    isDeuce,
    handleScore,
    handleUndo,
    handleReset,
  }
}
