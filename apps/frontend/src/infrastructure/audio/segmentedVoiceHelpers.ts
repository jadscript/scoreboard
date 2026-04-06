export type ScoreboardTeam = 'team1' | 'team2'

export type GamesScore = { team1: number; team2: number }

const POINT_LABELS = ['0', '15', '30', '40'] as const

const NO_AD = true

function gameWinnerNoAd(points: GamesScore): ScoreboardTeam | null {
  const { team1, team2 } = points
  if (team1 >= 4 && team1 > team2) return 'team1'
  if (team2 >= 4 && team2 > team1) return 'team2'
  return null
}

/** True if this point score wins the current game (same rules as useScoreboard `gameWinner`). */
export function isGameWinningPoint(pointsAfter: GamesScore, isTiebreak: boolean): boolean {
  const { team1, team2 } = pointsAfter
  if (isTiebreak) {
    if (team1 >= 7 && team1 - team2 >= 2) return true
    if (team2 >= 7 && team2 - team1 >= 2) return true
    return false
  }
  if (NO_AD) {
    if (team1 >= 4 && team1 > team2) return true
    if (team2 >= 4 && team2 > team1) return true
    return false
  }
  if (team1 >= 4 && team1 - team2 >= 2) return true
  if (team2 >= 4 && team2 - team1 >= 2) return true
  return false
}

export function getServingTeamForGame(games: GamesScore): ScoreboardTeam {
  const totalGames = games.team1 + games.team2
  return totalGames % 2 === 1 ? 'team2' : 'team1'
}

function pointLabelsForGameAudio(points: GamesScore, isTiebreak: boolean): { team1: string; team2: string } | null {
  if (isTiebreak) return null

  const { team1: t1, team2: t2 } = points

  if (NO_AD) {
    const winner = gameWinnerNoAd(points)
    if (winner) {
      const loser: ScoreboardTeam = winner === 'team1' ? 'team2' : 'team1'
      const pl = points[loser]
      const loserLabel = pl === 3 ? '30' : POINT_LABELS[Math.min(pl, 3)]
      return {
        team1: winner === 'team1' ? '40' : loserLabel,
        team2: winner === 'team2' ? '40' : loserLabel,
      }
    }
    if (t1 >= 3 && t2 >= 3) {
      return { team1: '40', team2: '40' }
    }
  }

  return {
    team1: POINT_LABELS[Math.min(t1, 3)],
    team2: POINT_LABELS[Math.min(t2, 3)],
  }
}

export function buildGameAudioKey(
  pointsAfter: GamesScore,
  serving: ScoreboardTeam,
  isTiebreak: boolean,
): string | null {
  if (isTiebreak) return null
  const labels = pointLabelsForGameAudio(pointsAfter, isTiebreak)
  if (!labels) return null
  const receiver: ScoreboardTeam = serving === 'team1' ? 'team2' : 'team1'
  return `game_${labels[serving]}_${labels[receiver]}`
}

export function teamPointClipKey(team: ScoreboardTeam): 'team_a_point' | 'team_b_point' {
  return team === 'team1' ? 'team_a_point' : 'team_b_point'
}
