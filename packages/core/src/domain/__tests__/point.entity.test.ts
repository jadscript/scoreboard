import { describe, it, expect } from 'vitest'
import { Point } from '../point.entity'

describe('Point', () => {
  describe('create', () => {
    it('creates a point for team1', () => {
      const point = Point.create('team1')
      expect(point.scorer).toBe('team1')
    })

    it('creates a point for team2', () => {
      const point = Point.create('team2')
      expect(point.scorer).toBe('team2')
    })

    it('generates a unique id on each call', () => {
      const a = Point.create('team1')
      const b = Point.create('team1')
      expect(a.id).not.toBe(b.id)
    })

    it('records the creation timestamp', () => {
      const before = new Date()
      const point = Point.create('team1')
      const after = new Date()
      expect(point.scoredAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(point.scoredAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('restore', () => {
    it('restores with the provided id, scorer and date', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const point = Point.restore('uuid-xyz', 'team2', date)
      expect(point.id).toBe('uuid-xyz')
      expect(point.scorer).toBe('team2')
      expect(point.scoredAt).toBe(date)
    })
  })

  describe('equals (inherited from Entity)', () => {
    it('returns true for points with the same id', () => {
      const date = new Date()
      const a = Point.restore('uuid-abc', 'team1', date)
      const b = Point.restore('uuid-abc', 'team2', date)
      expect(a.equals(b)).toBe(true)
    })

    it('returns false for points with different ids', () => {
      const a = Point.create('team1')
      const b = Point.create('team1')
      expect(a.equals(b)).toBe(false)
    })
  })
})
