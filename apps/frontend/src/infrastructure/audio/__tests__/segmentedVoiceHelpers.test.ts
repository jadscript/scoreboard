import { describe, expect, it } from 'vitest'
import {
  buildGameAudioKey,
  getServingTeamForGame,
  isGameWinningPoint,
  teamPointClipKey,
} from '../segmentedVoiceHelpers'

describe('getServingTeamForGame', () => {
  it('serves team1 when total games in set is even', () => {
    expect(getServingTeamForGame({ team1: 0, team2: 0 })).toBe('team1')
    expect(getServingTeamForGame({ team1: 1, team2: 1 })).toBe('team1')
  })

  it('serves team2 when total games in set is odd', () => {
    expect(getServingTeamForGame({ team1: 1, team2: 0 })).toBe('team2')
    expect(getServingTeamForGame({ team1: 2, team2: 1 })).toBe('team2')
  })
})

describe('buildGameAudioKey', () => {
  it('returns null in tie-break', () => {
    expect(buildGameAudioKey({ team1: 5, team2: 4 }, 'team1', true)).toBeNull()
  })

  it('builds deuce key 40-40 before decisive point', () => {
    const serving = getServingTeamForGame({ team1: 0, team2: 0 })
    expect(buildGameAudioKey({ team1: 3, team2: 3 }, serving, false)).toBe('game_40_40')
  })

  it('builds key after game point from deuce (4-3) with server/receiver order', () => {
    const games = { team1: 0, team2: 0 }
    const serving = getServingTeamForGame(games)
    const pointsAfter = { team1: 4, team2: 3 }
    const key = buildGameAudioKey(pointsAfter, serving, false)
    expect(key === 'game_40_30' || key === 'game_30_40').toBe(true)
  })

  it('maps team point clips', () => {
    expect(teamPointClipKey('team1')).toBe('team_a_point')
    expect(teamPointClipKey('team2')).toBe('team_b_point')
  })
})

describe('isGameWinningPoint', () => {
  it('is true when NO_AD game is won', () => {
    expect(isGameWinningPoint({ team1: 4, team2: 2 }, false)).toBe(true)
    expect(isGameWinningPoint({ team1: 2, team2: 4 }, false)).toBe(true)
  })

  it('is false mid-game', () => {
    expect(isGameWinningPoint({ team1: 2, team2: 1 }, false)).toBe(false)
    expect(isGameWinningPoint({ team1: 3, team2: 3 }, false)).toBe(false)
  })

  it('is true when tie-break is won', () => {
    expect(isGameWinningPoint({ team1: 7, team2: 5 }, true)).toBe(true)
    expect(isGameWinningPoint({ team1: 6, team2: 8 }, true)).toBe(true)
  })
})
