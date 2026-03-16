import { describe, it, expect, beforeEach } from 'vitest'
import { CreateMatchHandler } from '../commands/create-match/create-match.command'
import { InMemoryMatchRepository } from './helpers/in-memory-match.repository'
import { InMemoryPlayerRepository } from './helpers/in-memory-player.repository'
import { Player } from '../../domain/player.entity'
import { StartMatchHandler } from '../commands/start-match/start-match.command'

const male = () => Player.create('João', 'm@example.com', 'male', '+1')
const female = () => Player.create('Ana', 'f@example.com', 'female', '+2')

describe('CreateMatchHandler', () => {
  let matchRepository: InMemoryMatchRepository
  let playerRepository: InMemoryPlayerRepository
  let handler: CreateMatchHandler

  beforeEach(() => {
    matchRepository = new InMemoryMatchRepository()
    playerRepository = new InMemoryPlayerRepository()
    handler = new CreateMatchHandler(matchRepository, playerRepository)
  })

  describe('basic creation', () => {
    it('returns a matchId', async () => {
      const output = await handler.execute({ team1Name: 'Brazil', team2Name: 'Argentina' })
      expect(typeof output.matchId).toBe('string')
      expect(output.matchId.length).toBeGreaterThan(0)
    })

    it('persists the match in the repository', async () => {
      expect(matchRepository.size).toBe(0)
      const { matchId } = await handler.execute({ team1Name: 'Brazil', team2Name: 'Argentina' })
      expect(matchRepository.size).toBe(1)
      const saved = await matchRepository.findById(matchId)
      expect(saved).not.toBeNull()
    })

    it('sets the correct team names', async () => {
      const { matchId } = await handler.execute({ team1Name: 'Brazil', team2Name: 'Argentina' })
      const match = await matchRepository.findById(matchId)
      expect(match!.team1.name).toBe('Brazil')
      expect(match!.team2.name).toBe('Argentina')
    })

    it('creates the match with not_started status', async () => {
      const { matchId } = await handler.execute({ team1Name: 'A', team2Name: 'B' })
      const match = await matchRepository.findById(matchId)
      expect(match!.status).toBe('not_started')
      expect(match!.sets.length).toBe(0)
    })

    it('applies custom config', async () => {
      const { matchId } = await handler.execute({
        team1Name: 'A',
        team2Name: 'B',
        config: { bestOf: 1, noAd: false, finalSetSuperTiebreak: false },
      })
      const match = await matchRepository.findById(matchId)
      expect(match!.config.bestOf).toBe(1)
      expect(match!.config.noAd).toBe(false)
    })

    it('uses default config when none is provided', async () => {
      const { matchId } = await handler.execute({ team1Name: 'A', team2Name: 'B' })
      const match = await matchRepository.findById(matchId)
      expect(match!.config.bestOf).toBe(3)
      expect(match!.config.noAd).toBe(true)
    })

    it('generates unique ids for each match', async () => {
      const first = await handler.execute({ team1Name: 'A', team2Name: 'B' })
      const second = await handler.execute({ team1Name: 'C', team2Name: 'D' })
      expect(first.matchId).not.toBe(second.matchId)
    })
  })

  describe('player association', () => {
    it('creates a singles match with 1 player per team', async () => {
      const p1 = male()
      const p2 = female()
      await playerRepository.save(p1)
      await playerRepository.save(p2)

      const { matchId } = await handler.execute({
        team1Name: 'A',
        team2Name: 'B',
        team1PlayerIds: [p1.id],
        team2PlayerIds: [p2.id],
      })
      const match = await matchRepository.findById(matchId)
      expect(match!.matchType).toBe('singles')
      expect(match!.team1.players[0].id).toBe(p1.id)
    })

    it('creates a doubles_male match with 2 male players per team', async () => {
      const p1 = male()
      const p2 = male()
      const p3 = male()
      const p4 = male()
      await playerRepository.save(p1)
      await playerRepository.save(p2)
      await playerRepository.save(p3)
      await playerRepository.save(p4)

      const { matchId } = await handler.execute({
        team1Name: 'A',
        team2Name: 'B',
        team1PlayerIds: [p1.id, p2.id],
        team2PlayerIds: [p3.id, p4.id],
      })
      const match = await matchRepository.findById(matchId)
      expect(match!.matchType).toBe('doubles_male')
    })

    it('creates a doubles_mixed match with 1 male + 1 female per team', async () => {
      const p1 = male()
      const p2 = female()
      const p3 = male()
      const p4 = female()
      for (const p of [p1, p2, p3, p4]) await playerRepository.save(p)

      const { matchId } = await handler.execute({
        team1Name: 'A',
        team2Name: 'B',
        team1PlayerIds: [p1.id, p2.id],
        team2PlayerIds: [p3.id, p4.id],
      })
      const match = await matchRepository.findById(matchId)
      expect(match!.matchType).toBe('doubles_mixed')
    })

    it('throws when a player is not found', async () => {
      await expect(
        handler.execute({
          team1Name: 'A',
          team2Name: 'B',
          team1PlayerIds: ['nonexistent-id'],
          team2PlayerIds: ['other-nonexistent'],
        }),
      ).rejects.toThrow('One or more players from team 1 were not found')
    })

    it('throws when teams have different player counts (domain rule)', async () => {
      const p1 = male()
      const p2 = male()
      const p3 = female()
      await playerRepository.save(p1)
      await playerRepository.save(p2)
      await playerRepository.save(p3)

      await expect(
        handler.execute({
          team1Name: 'A',
          team2Name: 'B',
          team1PlayerIds: [p1.id, p2.id],
          team2PlayerIds: [p3.id],
        }),
      ).rejects.toThrow('Both teams must have the same number of players')
    })

    it('throws when a player is already in an active match (rule 1)', async () => {
      const p1 = male()
      const p2 = female()
      await playerRepository.save(p1)
      await playerRepository.save(p2)

      // First match — create + start (makes it active/in_progress)
      const { matchId } = await handler.execute({
        team1Name: 'A',
        team2Name: 'B',
        team1PlayerIds: [p1.id],
        team2PlayerIds: [p2.id],
      })
      const startMatch = new StartMatchHandler(matchRepository)
      await startMatch.execute({ matchId })

      // Second match with same player
      const p3 = female()
      await playerRepository.save(p3)
      await expect(
        handler.execute({
          team1Name: 'C',
          team2Name: 'D',
          team1PlayerIds: [p1.id],
          team2PlayerIds: [p3.id],
        }),
      ).rejects.toThrow('already in an active match')
    })

    it('matchType is null when no player ids are provided', async () => {
      const { matchId } = await handler.execute({ team1Name: 'A', team2Name: 'B' })
      const match = await matchRepository.findById(matchId)
      expect(match!.matchType).toBeNull()
    })
  })
})
