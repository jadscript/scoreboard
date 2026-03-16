import { describe, it, expect } from 'vitest'
import { Team } from '../team.vo'
import { Player } from '../../player.entity'

const male = () => Player.create('João', 'm@example.com', 'male', '+1')
const female = () => Player.create('Ana', 'f@example.com', 'female', '+2')

describe('Team', () => {
  describe('create', () => {
    it('creates a team with the given name', () => {
      const team = Team.create('Brazil')
      expect(team.name).toBe('Brazil')
    })

    it('generates a unique id for each team created', () => {
      const a = Team.create('Brazil')
      const b = Team.create('Argentina')
      expect(a.id).not.toBe(b.id)
    })

    it('generates a non-empty string id', () => {
      const team = Team.create('Brazil')
      expect(typeof team.id).toBe('string')
      expect(team.id.length).toBeGreaterThan(0)
    })

    it('starts with no players by default', () => {
      const team = Team.create('Brazil')
      expect(team.players).toHaveLength(0)
    })

    it('stores the provided players', () => {
      const p1 = male()
      const p2 = female()
      const team = Team.create('Brazil', [p1, p2])
      expect(team.players).toHaveLength(2)
      expect(team.players[0].id).toBe(p1.id)
      expect(team.players[1].id).toBe(p2.id)
    })

    it('players returns an immutable copy', () => {
      const team = Team.create('Brazil', [male()])
      const copy = team.players as unknown[]
      copy.push({})
      expect(team.players).toHaveLength(1)
    })
  })

  describe('restore', () => {
    it('restores a team with the provided id and name', () => {
      const team = Team.restore('uuid-123', 'Chile')
      expect(team.id).toBe('uuid-123')
      expect(team.name).toBe('Chile')
    })

    it('restores a team with players', () => {
      const p = male()
      const team = Team.restore('uuid-123', 'Chile', [p])
      expect(team.players).toHaveLength(1)
      expect(team.players[0].id).toBe(p.id)
    })
  })

  describe('equals', () => {
    it('returns true for teams with the same id', () => {
      const a = Team.restore('uuid-abc', 'Brazil')
      const b = Team.restore('uuid-abc', 'Brazil')
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for teams with different ids', () => {
      const a = Team.create('Brazil')
      const b = Team.create('Brazil')
      expect(a.equals(b)).toBe(false)
    })

    it('returns true when ids match even if names differ (equals compares by id only)', () => {
      const a = Team.restore('uuid-abc', 'Brazil')
      const b = Team.restore('uuid-abc', 'Argentina')
      expect(a.equals(b)).toBe(true)
    })
  })
})
