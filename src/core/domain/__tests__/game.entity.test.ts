import { describe, it, expect } from 'vitest'
import { Game } from '../game.entity'
import type { PointScorer } from '../shared/types'

/** Scores n points for the given scorer */
function score(game: Game, scorer: PointScorer, n = 1): void {
  for (let i = 0; i < n; i++) game.addPoint(scorer)
}

/** Wins a regular game without going through deuce (4 direct points) */
function winGame(game: Game, winner: PointScorer): void {
  score(game, winner, 4)
}

describe('Game', () => {
  describe('initial state', () => {
    it('starts with no winner', () => {
      const game = Game.create()
      expect(game.winner).toBeNull()
    })

    it('starts as not finished', () => {
      const game = Game.create()
      expect(game.isFinished).toBe(false)
    })

    it('starts with no points', () => {
      const game = Game.create()
      expect(game.points).toHaveLength(0)
    })

    it('default type is regular', () => {
      const game = Game.create()
      expect(game.type).toBe('regular')
      expect(game.isTiebreak).toBe(false)
    })

    it('noAd defaults to false', () => {
      const game = Game.create()
      expect(game.noAd).toBe(false)
    })
  })

  describe('addPoint', () => {
    it('adds points to the history', () => {
      const game = Game.create()
      game.addPoint('team1')
      game.addPoint('team2')
      expect(game.points).toHaveLength(2)
    })

    it('throws when scoring in a finished game', () => {
      const game = Game.create()
      winGame(game, 'team1')
      expect(() => game.addPoint('team2')).toThrow('Cannot score a point in a finished game')
    })
  })

  describe('getScore — regular game', () => {
    it('0-0 → "0" / "0"', () => {
      const game = Game.create()
      expect(game.getScore()).toEqual({ team1: '0', team2: '0' })
    })

    it('1-0 → "15" / "0"', () => {
      const game = Game.create()
      score(game, 'team1')
      expect(game.getScore()).toEqual({ team1: '15', team2: '0' })
    })

    it('2-0 → "30" / "0"', () => {
      const game = Game.create()
      score(game, 'team1', 2)
      expect(game.getScore()).toEqual({ team1: '30', team2: '0' })
    })

    it('3-0 → "40" / "0"', () => {
      const game = Game.create()
      score(game, 'team1', 3)
      expect(game.getScore()).toEqual({ team1: '40', team2: '0' })
    })

    it('1-2 → "15" / "30"', () => {
      const game = Game.create()
      score(game, 'team1')
      score(game, 'team2', 2)
      expect(game.getScore()).toEqual({ team1: '15', team2: '30' })
    })

    it('3-3 → "Deuce" / "Deuce"', () => {
      const game = Game.create()
      score(game, 'team1', 3)
      score(game, 'team2', 3)
      expect(game.getScore()).toEqual({ team1: 'Deuce', team2: 'Deuce' })
    })

    it('4-3 → "Advantage" / ""', () => {
      const game = Game.create()
      score(game, 'team1', 3)
      score(game, 'team2', 3)
      score(game, 'team1')
      expect(game.getScore()).toEqual({ team1: 'Advantage', team2: '' })
    })

    it('3-4 → "" / "Advantage"', () => {
      const game = Game.create()
      score(game, 'team1', 3)
      score(game, 'team2', 3)
      score(game, 'team2')
      expect(game.getScore()).toEqual({ team1: '', team2: 'Advantage' })
    })
  })

  describe('win — regular game', () => {
    it('team1 wins 4-0', () => {
      const game = Game.create()
      score(game, 'team1', 4)
      expect(game.isFinished).toBe(true)
      expect(game.winner).toBe('team1')
    })

    it('team1 wins 4-1', () => {
      const game = Game.create()
      score(game, 'team1', 2)
      score(game, 'team2')
      score(game, 'team1', 2)
      expect(game.winner).toBe('team1')
    })

    it('team1 wins 4-2', () => {
      const game = Game.create()
      score(game, 'team1', 2)
      score(game, 'team2', 2)
      score(game, 'team1', 2)
      expect(game.winner).toBe('team1')
    })

    it('team2 wins 4-0', () => {
      const game = Game.create()
      score(game, 'team2', 4)
      expect(game.winner).toBe('team2')
    })

    it('team1 wins after deuce (5-3)', () => {
      const game = Game.create()
      score(game, 'team1', 3)
      score(game, 'team2', 3) // deuce
      score(game, 'team1', 2) // advantage then win
      expect(game.winner).toBe('team1')
    })

    it('team2 wins after deuce (3-5)', () => {
      const game = Game.create()
      score(game, 'team1', 3)
      score(game, 'team2', 3) // deuce
      score(game, 'team2', 2)
      expect(game.winner).toBe('team2')
    })

    it('team1 wins after multiple deuces (6-4)', () => {
      const game = Game.create()
      score(game, 'team1', 3)
      score(game, 'team2', 3) // deuce
      score(game, 'team1')    // advantage team1
      score(game, 'team2')    // back to deuce
      score(game, 'team1', 2) // advantage then win
      expect(game.winner).toBe('team1')
    })

    it('does not win at 4-3 (advantage, not enough lead)', () => {
      const game = Game.create()
      score(game, 'team1', 3)
      score(game, 'team2', 3) // deuce
      score(game, 'team1')    // 4-3, advantage but not a win yet
      expect(game.isFinished).toBe(false)
    })
  })

  describe('regular game — noAd', () => {
    it('scores normally up to 3-3', () => {
      const game = Game.create('regular', true)
      score(game, 'team1', 3)
      score(game, 'team2', 3)
      expect(game.isFinished).toBe(false)
      // noAd shows "40" / "40" instead of Deuce
      expect(game.getScore()).toEqual({ team1: '40', team2: '40' })
    })

    it('at deuce (3-3), next point wins — team1', () => {
      const game = Game.create('regular', true)
      score(game, 'team1', 3)
      score(game, 'team2', 3) // deuce (3-3)
      score(game, 'team1')    // next point wins
      expect(game.winner).toBe('team1')
      expect(game.isFinished).toBe(true)
    })

    it('at deuce (3-3), next point wins — team2', () => {
      const game = Game.create('regular', true)
      score(game, 'team1', 3)
      score(game, 'team2', 3)
      score(game, 'team2')
      expect(game.winner).toBe('team2')
    })

    it('wins normally before deuce (4-2)', () => {
      const game = Game.create('regular', true)
      score(game, 'team1', 2)
      score(game, 'team2', 2)
      score(game, 'team1', 2)
      expect(game.winner).toBe('team1')
    })
  })

  describe('tiebreak (first to 7, win by 2)', () => {
    it('tiebreak type has isTiebreak true', () => {
      const game = Game.create('tiebreak')
      expect(game.isTiebreak).toBe(true)
    })

    it('displays raw count (not tennis labels)', () => {
      const game = Game.create('tiebreak')
      score(game, 'team1', 3)
      score(game, 'team2', 2)
      expect(game.getScore()).toEqual({ team1: '3', team2: '2' })
    })

    it('team1 wins 7-0', () => {
      const game = Game.create('tiebreak')
      score(game, 'team1', 7)
      expect(game.winner).toBe('team1')
    })

    it('team1 wins 7-5', () => {
      const game = Game.create('tiebreak')
      score(game, 'team1', 5)
      score(game, 'team2', 5)
      score(game, 'team1', 2)
      expect(game.winner).toBe('team1')
    })

    it('does not win at 7-6 (lead of only 1)', () => {
      const game = Game.create('tiebreak')
      score(game, 'team1', 6)
      score(game, 'team2', 6)
      score(game, 'team1')
      expect(game.isFinished).toBe(false)
    })

    it('team1 wins 8-6 after 6-6', () => {
      const game = Game.create('tiebreak')
      score(game, 'team1', 6)
      score(game, 'team2', 6)
      score(game, 'team1', 2)
      expect(game.winner).toBe('team1')
    })

    it('team2 wins 7-3', () => {
      const game = Game.create('tiebreak')
      score(game, 'team1', 3)
      score(game, 'team2', 7)
      expect(game.winner).toBe('team2')
    })
  })

  describe('super tiebreak (first to 10, win by 2)', () => {
    it('super-tiebreak type has isTiebreak true', () => {
      const game = Game.create('super-tiebreak')
      expect(game.isTiebreak).toBe(true)
    })

    it('displays raw count', () => {
      const game = Game.create('super-tiebreak')
      score(game, 'team1', 10)
      expect(game.getScore()).toEqual({ team1: '10', team2: '0' })
    })

    it('team1 wins 10-0', () => {
      const game = Game.create('super-tiebreak')
      score(game, 'team1', 10)
      expect(game.winner).toBe('team1')
    })

    it('team1 wins 10-8', () => {
      const game = Game.create('super-tiebreak')
      score(game, 'team1', 8)
      score(game, 'team2', 8)
      score(game, 'team1', 2)
      expect(game.winner).toBe('team1')
    })

    it('does not win at 10-9 (lead of only 1)', () => {
      const game = Game.create('super-tiebreak')
      score(game, 'team1', 9)
      score(game, 'team2', 9)
      score(game, 'team1')
      expect(game.isFinished).toBe(false)
    })

    it('team1 wins 11-9 after 9-9', () => {
      const game = Game.create('super-tiebreak')
      score(game, 'team1', 9)
      score(game, 'team2', 9)
      score(game, 'team1', 2)
      expect(game.winner).toBe('team1')
    })

    it('team2 wins 10-4', () => {
      const game = Game.create('super-tiebreak')
      score(game, 'team1', 4)
      score(game, 'team2', 10)
      expect(game.winner).toBe('team2')
    })
  })
})
