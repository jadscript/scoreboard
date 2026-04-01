import { describe, it, expect } from 'vitest'
import { Player } from '../player.entity'

describe('Player', () => {
  describe('create', () => {
    it('creates a player with the provided fields', () => {
      const player = Player.create('Alice', 'alice@example.com', 'female', '+5511999990000')
      expect(player.name).toBe('Alice')
      expect(player.userId).toBe('alice@example.com')
      expect(player.gender).toBe('female')
      expect(player.whatsapp).toBe('+5511999990000')
      expect(player.photoUrl).toBeNull()
    })

    it('stores a photoUrl when provided', () => {
      const player = Player.create(
        'Bob',
        'bob@example.com',
        'male',
        '+5511999990001',
        'https://cdn/bob.jpg',
      )
      expect(player.photoUrl).toBe('https://cdn/bob.jpg')
    })

    it('allows null whatsapp', () => {
      const player = Player.create('NoPhone', 'u1', 'unknown', null)
      expect(player.whatsapp).toBeNull()
      expect(player.gender).toBe('unknown')
    })

    it('generates a unique id for each player', () => {
      const a = Player.create('A', 'a@example.com', 'male', '+1')
      const b = Player.create('B', 'b@example.com', 'female', '+2')
      expect(a.id).not.toBe(b.id)
    })

    it('generates a non-empty string id', () => {
      const player = Player.create('C', 'c@example.com', 'male', '+3')
      expect(typeof player.id).toBe('string')
      expect(player.id.length).toBeGreaterThan(0)
    })
  })

  describe('restore', () => {
    it('restores a player with the provided id and fields', () => {
      const player = Player.restore('uuid-42', 'Diana', 'd@example.com', 'female', '+4', null)
      expect(player.id).toBe('uuid-42')
      expect(player.name).toBe('Diana')
      expect(player.userId).toBe('d@example.com')
      expect(player.gender).toBe('female')
      expect(player.photoUrl).toBeNull()
    })
  })
})
