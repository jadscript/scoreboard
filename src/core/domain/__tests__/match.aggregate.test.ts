import { describe, it, expect } from 'vitest'
import { Match } from '../match.aggregate'
import { Team } from '../value-objects/team.vo'
import { MatchConfig } from '../value-objects/match-config.vo'
import { Player } from '../player.entity'
import type { PointScorer } from '../shared/types'

const team1 = Team.create('Brazil')
const team2 = Team.create('Argentina')

const male = () => Player.create('João', 'm@example.com', 'male', '+1')
const female = () => Player.create('Ana', 'f@example.com', 'female', '+2')

/** Wins an entire game for the given winner (4 direct points) */
function winGame(match: Match, winner: PointScorer): void {
  for (let i = 0; i < 4; i++) match.scorePoint(winner)
}

/** Wins N games for the given winner */
function winGames(match: Match, winner: PointScorer, n: number): void {
  for (let i = 0; i < n; i++) winGame(match, winner)
}

/** Wins an entire set for the given winner (6-0) */
function winSet(match: Match, winner: PointScorer): void {
  winGames(match, winner, 6)
}

/** Wins a super tiebreak for the given winner (10 direct points) */
function winSuperTiebreak(match: Match, winner: PointScorer): void {
  for (let i = 0; i < 10; i++) match.scorePoint(winner)
}

describe('Match', () => {
  describe('matchType and player validation', () => {
    it('matchType is null when teams have no players', () => {
      const match = Match.create(team1, team2)
      expect(match.matchType).toBeNull()
    })

    it('matchType is singles with 1 player per team', () => {
      const t1 = Team.create('A', [male()])
      const t2 = Team.create('B', [female()])
      expect(Match.create(t1, t2).matchType).toBe('singles')
    })

    it('matchType is doubles_male with 2 male players per team', () => {
      const t1 = Team.create('A', [male(), male()])
      const t2 = Team.create('B', [male(), male()])
      expect(Match.create(t1, t2).matchType).toBe('doubles_male')
    })

    it('matchType is doubles_female with 2 female players per team', () => {
      const t1 = Team.create('A', [female(), female()])
      const t2 = Team.create('B', [female(), female()])
      expect(Match.create(t1, t2).matchType).toBe('doubles_female')
    })

    it('matchType is doubles_mixed with 1 male + 1 female per team', () => {
      const t1 = Team.create('A', [male(), female()])
      const t2 = Team.create('B', [male(), female()])
      expect(Match.create(t1, t2).matchType).toBe('doubles_mixed')
    })

    it('throws when teams have different player counts', () => {
      const t1 = Team.create('A', [male()])
      const t2 = Team.create('B', [male(), female()])
      expect(() => Match.create(t1, t2)).toThrow('Both teams must have the same number of players')
    })

    it('throws when one team has players and the other does not', () => {
      const t1 = Team.create('A', [male()])
      const t2 = Team.create('B')
      expect(() => Match.create(t1, t2)).toThrow('Both teams must have the same number of players')
    })

    it('throws when teams have inconsistent gender compositions', () => {
      const t1 = Team.create('A', [male(), male()])
      const t2 = Team.create('B', [male(), female()])
      expect(() => Match.create(t1, t2)).toThrow('Inconsistent player genders between teams')
    })

    it('throws when teams have more than 2 players', () => {
      const t1 = Team.create('A', [male(), male(), male()])
      const t2 = Team.create('B', [male(), male(), male()])
      expect(() => Match.create(t1, t2)).toThrow('Teams must have 1 or 2 players')
    })
  })

  describe('creation and initial state', () => {
    it('starts with status not_started', () => {
      const match = Match.create(team1, team2)
      expect(match.status).toBe('not_started')
    })

    it('starts with no winner', () => {
      const match = Match.create(team1, team2)
      expect(match.winner).toBeNull()
    })

    it('starts with no sets', () => {
      const match = Match.create(team1, team2)
      expect(match.sets).toHaveLength(0)
    })

    it('isFinished is false at the start', () => {
      const match = Match.create(team1, team2)
      expect(match.isFinished).toBe(false)
    })

    it('currentSet is null before the match starts', () => {
      const match = Match.create(team1, team2)
      expect(match.currentSet).toBeNull()
    })

    it('exposes the teams correctly', () => {
      const match = Match.create(team1, team2)
      expect(match.team1).toBe(team1)
      expect(match.team2).toBe(team2)
    })

    it('uses the default config when none is provided', () => {
      const match = Match.create(team1, team2)
      expect(match.config.bestOf).toBe(3)
      expect(match.config.noAd).toBe(true)
    })

    it('uses the provided custom config', () => {
      const config = MatchConfig.create({ bestOf: 1, noAd: false })
      const match = Match.create(team1, team2, config)
      expect(match.config.bestOf).toBe(1)
      expect(match.config.noAd).toBe(false)
    })
  })

  describe('start', () => {
    it('transitions status to in_progress', () => {
      const match = Match.create(team1, team2)
      match.start()
      expect(match.status).toBe('in_progress')
    })

    it('creates the first set', () => {
      const match = Match.create(team1, team2)
      match.start()
      expect(match.sets).toHaveLength(1)
      expect(match.currentSet).not.toBeNull()
    })

    it('throws if called more than once', () => {
      const match = Match.create(team1, team2)
      match.start()
      expect(() => match.start()).toThrow('The match has already started')
    })

    it('throws if called after the match is already finished', () => {
      const config = MatchConfig.create({ bestOf: 1 })
      const match = Match.create(team1, team2, config)
      match.start()
      winSet(match, 'team1')
      expect(() => match.start()).toThrow('The match has already started')
    })
  })

  describe('scorePoint — state guards', () => {
    it('throws if the match has not started', () => {
      const match = Match.create(team1, team2)
      expect(() => match.scorePoint('team1')).toThrow('The match is not in progress')
    })

    it('throws if the match is already finished', () => {
      const config = MatchConfig.create({ bestOf: 1 })
      const match = Match.create(team1, team2, config)
      match.start()
      winSet(match, 'team1')
      expect(() => match.scorePoint('team1')).toThrow('The match is not in progress')
    })
  })

  describe('progression — best of 3', () => {
    it('team1 wins the match 2-0 in sets', () => {
      const match = Match.create(team1, team2, MatchConfig.create({ bestOf: 3 }))
      match.start()
      winSet(match, 'team1') // set 1
      winSet(match, 'team1') // set 2 (3rd would be super tiebreak)
      expect(match.winner).toBe('team1')
      expect(match.status).toBe('finished')
      expect(match.isFinished).toBe(true)
    })

    it('team2 wins the match 2-0 in sets', () => {
      const match = Match.create(team1, team2, MatchConfig.create({ bestOf: 3 }))
      match.start()
      winSet(match, 'team2')
      winSet(match, 'team2')
      expect(match.winner).toBe('team2')
    })

    it('score is 1-1 before the deciding set', () => {
      const match = Match.create(team1, team2, MatchConfig.create({ bestOf: 3 }))
      match.start()
      winSet(match, 'team1') // 1-0
      winSet(match, 'team2') // 1-1
      expect(match.getSetScore()).toEqual({ team1: 1, team2: 1 })
      expect(match.isFinished).toBe(false)
    })

    it('3rd set is a super tiebreak by default', () => {
      const match = Match.create(team1, team2, MatchConfig.create({ bestOf: 3 }))
      match.start()
      winSet(match, 'team1')
      winSet(match, 'team2')
      expect(match.currentSet?.isSuperTiebreak).toBe(true)
    })

    it('team1 wins the match 2-1 via super tiebreak', () => {
      const match = Match.create(team1, team2, MatchConfig.create({ bestOf: 3 }))
      match.start()
      winSet(match, 'team1')
      winSet(match, 'team2')
      winSuperTiebreak(match, 'team1')
      expect(match.winner).toBe('team1')
      expect(match.status).toBe('finished')
    })

    it('deciding set is a normal set when super tiebreak is disabled', () => {
      const config = MatchConfig.create({ bestOf: 3, finalSetSuperTiebreak: false })
      const match = Match.create(team1, team2, config)
      match.start()
      winSet(match, 'team1')
      winSet(match, 'team2')
      expect(match.currentSet?.isSuperTiebreak).toBe(false)
    })
  })

  describe('progression — best of 1', () => {
    it('team1 wins by winning the only set', () => {
      const config = MatchConfig.create({ bestOf: 1 })
      const match = Match.create(team1, team2, config)
      match.start()
      winSet(match, 'team1')
      expect(match.winner).toBe('team1')
      expect(match.isFinished).toBe(true)
    })

    it('the only set is not a super tiebreak (best-of-1 never uses super tiebreak)', () => {
      const config = MatchConfig.create({ bestOf: 1 })
      const match = Match.create(team1, team2, config)
      match.start()
      expect(match.currentSet?.isSuperTiebreak).toBe(false)
    })

    it('does not create new sets after the match ends', () => {
      const config = MatchConfig.create({ bestOf: 1 })
      const match = Match.create(team1, team2, config)
      match.start()
      winSet(match, 'team1')
      expect(match.sets).toHaveLength(1)
    })
  })

  describe('getSetScore', () => {
    it('returns 0-0 before any set is completed', () => {
      const match = Match.create(team1, team2)
      match.start()
      expect(match.getSetScore()).toEqual({ team1: 0, team2: 0 })
    })

    it('correctly counts sets won by each team', () => {
      const match = Match.create(team1, team2, MatchConfig.create({ bestOf: 3 }))
      match.start()
      winSet(match, 'team1')
      winSet(match, 'team2')
      expect(match.getSetScore()).toEqual({ team1: 1, team2: 1 })
    })
  })

  describe('domain events', () => {
    it('fires PointScored after each point', () => {
      const match = Match.create(team1, team2)
      match.start()
      match.scorePoint('team1')
      const events = match.pullDomainEvents()
      expect(events.some((e) => e.eventName === 'PointScored')).toBe(true)
    })

    it('fires GameWon when a game ends', () => {
      const match = Match.create(team1, team2)
      match.start()
      winGame(match, 'team1')
      const events = match.pullDomainEvents()
      expect(events.some((e) => e.eventName === 'GameWon')).toBe(true)
    })

    it('fires SetWon when a set ends', () => {
      const match = Match.create(team1, team2)
      match.start()
      winSet(match, 'team1')
      const events = match.pullDomainEvents()
      expect(events.some((e) => e.eventName === 'SetWon')).toBe(true)
    })

    it('fires MatchWon when the match ends', () => {
      const config = MatchConfig.create({ bestOf: 1 })
      const match = Match.create(team1, team2, config)
      match.start()
      winSet(match, 'team1')
      const events = match.pullDomainEvents()
      expect(events.some((e) => e.eventName === 'MatchWon')).toBe(true)
    })

    it('pullDomainEvents clears the queue after returning', () => {
      const match = Match.create(team1, team2)
      match.start()
      match.scorePoint('team1')
      match.pullDomainEvents() // first call consumes the events
      const second = match.pullDomainEvents()
      expect(second).toHaveLength(0)
    })

    it('PointScored carries the correct scorer', () => {
      const match = Match.create(team1, team2)
      match.start()
      match.scorePoint('team2')
      const events = match.pullDomainEvents()
      const pointEvent = events.find((e) => e.eventName === 'PointScored') as
        | { scorer: PointScorer }
        | undefined
      expect(pointEvent?.scorer).toBe('team2')
    })

    it('MatchWon carries the correct winner', () => {
      const config = MatchConfig.create({ bestOf: 1 })
      const match = Match.create(team1, team2, config)
      match.start()
      winSet(match, 'team2')
      const events = match.pullDomainEvents()
      const wonEvent = events.find((e) => e.eventName === 'MatchWon') as
        | { winner: PointScorer }
        | undefined
      expect(wonEvent?.winner).toBe('team2')
    })

    it('does not fire MatchWon before the match is decided', () => {
      const config = MatchConfig.create({ bestOf: 3 })
      const match = Match.create(team1, team2, config)
      match.start()
      winSet(match, 'team1') // 1-0, not finished yet
      const events = match.pullDomainEvents()
      expect(events.some((e) => e.eventName === 'MatchWon')).toBe(false)
    })
  })
})
