import { describe, it, expect } from 'vitest'
import { MatchConfig } from '../match-config.vo'

describe('MatchConfig', () => {
  describe('default values', () => {
    it('bestOf defaults to 3', () => {
      const config = MatchConfig.create()
      expect(config.bestOf).toBe(3)
    })

    it('noAd defaults to true (official beach tennis rule)', () => {
      const config = MatchConfig.create()
      expect(config.noAd).toBe(true)
    })

    it('finalSetSuperTiebreak defaults to true', () => {
      const config = MatchConfig.create()
      expect(config.finalSetSuperTiebreak).toBe(true)
    })
  })

  describe('custom values', () => {
    it('accepts bestOf 1', () => {
      const config = MatchConfig.create({ bestOf: 1 })
      expect(config.bestOf).toBe(1)
    })

    it('accepts bestOf 3', () => {
      const config = MatchConfig.create({ bestOf: 3 })
      expect(config.bestOf).toBe(3)
    })

    it('accepts bestOf 5', () => {
      const config = MatchConfig.create({ bestOf: 5 })
      expect(config.bestOf).toBe(5)
    })

    it('accepts noAd false', () => {
      const config = MatchConfig.create({ noAd: false })
      expect(config.noAd).toBe(false)
    })

    it('accepts finalSetSuperTiebreak false', () => {
      const config = MatchConfig.create({ finalSetSuperTiebreak: false })
      expect(config.finalSetSuperTiebreak).toBe(false)
    })
  })

  describe('setsToWin', () => {
    it('bestOf 1 → requires 1 set to win', () => {
      const config = MatchConfig.create({ bestOf: 1 })
      expect(config.setsToWin).toBe(1)
    })

    it('bestOf 3 → requires 2 sets to win', () => {
      const config = MatchConfig.create({ bestOf: 3 })
      expect(config.setsToWin).toBe(2)
    })

    it('bestOf 5 → requires 3 sets to win', () => {
      const config = MatchConfig.create({ bestOf: 5 })
      expect(config.setsToWin).toBe(3)
    })
  })
})
