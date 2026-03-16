import { describe, it, expect } from 'vitest'
import { SetEntity } from '../set.entity'
import type { PointScorer } from '../shared/types'

/** Wins an entire game for the given winner (4 direct points) */
function winGame(set: SetEntity, winner: PointScorer): void {
  for (let i = 0; i < 4; i++) set.scorePoint(winner)
}

/** Wins a tiebreak for the given winner (7 direct points) */
function winTiebreak(set: SetEntity, winner: PointScorer): void {
  for (let i = 0; i < 7; i++) set.scorePoint(winner)
}

/** Wins a super tiebreak for the given winner (10 direct points) */
function winSuperTiebreak(set: SetEntity, winner: PointScorer): void {
  for (let i = 0; i < 10; i++) set.scorePoint(winner)
}

/** Wins N games for the given winner */
function winGames(set: SetEntity, winner: PointScorer, n: number): void {
  for (let i = 0; i < n; i++) winGame(set, winner)
}

/**
 * Brings the set score to 6-6 by alternating game wins between the two teams.
 * Calling winGames(6) for each team separately is not possible because
 * the first team would close the set at 6-0.
 */
function reachSixSix(set: SetEntity): void {
  for (let i = 0; i < 6; i++) {
    winGame(set, 'team1')
    winGame(set, 'team2')
  }
}

describe('SetEntity', () => {
  describe('initial state', () => {
    it('starts with no winner', () => {
      const set = SetEntity.create()
      expect(set.winner).toBeNull()
      expect(set.isFinished).toBe(false)
    })

    it('starts with one active game', () => {
      const set = SetEntity.create()
      expect(set.games).toHaveLength(1)
      expect(set.currentGame).not.toBeNull()
    })

    it('isSuperTiebreak defaults to false', () => {
      const set = SetEntity.create()
      expect(set.isSuperTiebreak).toBe(false)
    })

    it('getScore returns 0-0 at the start', () => {
      const set = SetEntity.create()
      expect(set.getScore()).toEqual({ team1: 0, team2: 0 })
    })
  })

  describe('game progression', () => {
    it('score goes to 1-0 after winning a game', () => {
      const set = SetEntity.create()
      winGame(set, 'team1')
      expect(set.getScore()).toEqual({ team1: 1, team2: 0 })
    })

    it('automatically starts a new game after each finished game', () => {
      const set = SetEntity.create()
      winGame(set, 'team1')
      expect(set.currentGame).not.toBeNull()
    })

    it('games accumulates all games (finished + current)', () => {
      const set = SetEntity.create()
      winGame(set, 'team1') // game 1 finished
      winGame(set, 'team2') // game 2 finished
      // 2 finished + 1 in progress
      expect(set.games).toHaveLength(3)
    })
  })

  describe('set win', () => {
    it('team1 wins 6-0', () => {
      const set = SetEntity.create()
      winGames(set, 'team1', 6)
      expect(set.winner).toBe('team1')
      expect(set.isFinished).toBe(true)
    })

    it('team2 wins 0-6', () => {
      const set = SetEntity.create()
      winGames(set, 'team2', 6)
      expect(set.winner).toBe('team2')
    })

    it('team1 wins 6-1', () => {
      const set = SetEntity.create()
      winGame(set, 'team2')
      winGames(set, 'team1', 6)
      expect(set.winner).toBe('team1')
    })

    it('team1 wins 6-2', () => {
      const set = SetEntity.create()
      winGames(set, 'team2', 2)
      winGames(set, 'team1', 6)
      expect(set.winner).toBe('team1')
    })

    it('team1 wins 6-3', () => {
      const set = SetEntity.create()
      winGames(set, 'team2', 3)
      winGames(set, 'team1', 6)
      expect(set.winner).toBe('team1')
    })

    it('team1 wins 6-4', () => {
      const set = SetEntity.create()
      winGames(set, 'team2', 4)
      winGames(set, 'team1', 6)
      expect(set.winner).toBe('team1')
    })

    it('team1 wins 7-5 (no tiebreak)', () => {
      const set = SetEntity.create()
      winGames(set, 'team1', 5)
      winGames(set, 'team2', 5) // 5-5
      winGames(set, 'team1', 2) // 7-5
      expect(set.winner).toBe('team1')
      expect(set.getScore()).toEqual({ team1: 7, team2: 5 })
    })

    it('team2 wins 5-7', () => {
      const set = SetEntity.create()
      winGames(set, 'team1', 5)
      winGames(set, 'team2', 5) // 5-5
      winGames(set, 'team2', 2) // 5-7
      expect(set.winner).toBe('team2')
    })

    it('does not win at 6-5 (lead of only 1)', () => {
      const set = SetEntity.create()
      winGames(set, 'team1', 5)
      winGames(set, 'team2', 5)
      winGame(set, 'team1') // 6-5
      expect(set.isFinished).toBe(false)
      expect(set.getScore()).toEqual({ team1: 6, team2: 5 })
    })
  })

  describe('tiebreak at 6-6', () => {
    it('creates a tiebreak game when score reaches 6-6', () => {
      const set = SetEntity.create()
      reachSixSix(set)
      expect(set.currentGame?.type).toBe('tiebreak')
    })

    it('team1 wins the set 7-6 after winning the tiebreak', () => {
      const set = SetEntity.create()
      reachSixSix(set)
      winTiebreak(set, 'team1')
      expect(set.winner).toBe('team1')
      expect(set.getScore()).toEqual({ team1: 7, team2: 6 })
    })

    it('team2 wins the set 6-7 after winning the tiebreak', () => {
      const set = SetEntity.create()
      reachSixSix(set)
      winTiebreak(set, 'team2')
      expect(set.winner).toBe('team2')
      expect(set.getScore()).toEqual({ team1: 6, team2: 7 })
    })
  })

  describe('super tiebreak set', () => {
    it('creates a single super-tiebreak game', () => {
      const set = SetEntity.create({ isSuperTiebreak: true })
      expect(set.isSuperTiebreak).toBe(true)
      expect(set.games).toHaveLength(1)
      expect(set.currentGame?.type).toBe('super-tiebreak')
    })

    it('team1 wins the set by winning the super tiebreak', () => {
      const set = SetEntity.create({ isSuperTiebreak: true })
      winSuperTiebreak(set, 'team1')
      expect(set.winner).toBe('team1')
      expect(set.isFinished).toBe(true)
    })

    it('team2 wins the set by winning the super tiebreak', () => {
      const set = SetEntity.create({ isSuperTiebreak: true })
      winSuperTiebreak(set, 'team2')
      expect(set.winner).toBe('team2')
    })
  })

  describe('state guards', () => {
    it('currentGame returns null after the set is finished', () => {
      const set = SetEntity.create()
      winGames(set, 'team1', 6)
      expect(set.currentGame).toBeNull()
    })

    it('throws when scoring in a finished set', () => {
      const set = SetEntity.create()
      winGames(set, 'team1', 6)
      expect(() => set.scorePoint('team2')).toThrow('Cannot score a point in a finished set')
    })

    it('games returns an immutable copy (external push does not affect state)', () => {
      const set = SetEntity.create()
      const copy = set.games as unknown[]
      const lengthBefore = copy.length
      copy.push({})
      expect(set.games).toHaveLength(lengthBefore)
    })
  })
})
