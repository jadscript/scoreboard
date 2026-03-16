import { describe, it, expect, beforeEach } from 'vitest'
import { CreateMatchHandler } from '../commands/create-match/create-match.command'
import { StartMatchHandler } from '../commands/start-match/start-match.command'
import { ScorePointHandler } from '../commands/score-point/score-point.command'
import { InMemoryMatchRepository } from './helpers/in-memory-match.repository'
import { InMemoryPlayerRepository } from './helpers/in-memory-player.repository'

/**
 * Wins a full game for the given scorer (noAd mode: 4 points wins).
 */
async function winGame(
  handler: ScorePointHandler,
  matchId: string,
  scorer: 'team1' | 'team2',
): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await handler.execute({ matchId, scorer })
  }
}

/**
 * Wins a full set for the given scorer (6 games × 4 points, noAd).
 */
async function winSet(
  handler: ScorePointHandler,
  matchId: string,
  scorer: 'team1' | 'team2',
): Promise<void> {
  for (let g = 0; g < 6; g++) {
    await winGame(handler, matchId, scorer)
  }
}

describe('ScorePointHandler', () => {
  let repository: InMemoryMatchRepository
  let createMatch: CreateMatchHandler
  let startMatch: StartMatchHandler
  let scorePoint: ScorePointHandler
  let matchId: string

  beforeEach(async () => {
    repository = new InMemoryMatchRepository()
    createMatch = new CreateMatchHandler(repository, new InMemoryPlayerRepository())
    startMatch = new StartMatchHandler(repository)
    scorePoint = new ScorePointHandler(repository)

    const result = await createMatch.execute({ team1Name: 'Brazil', team2Name: 'Argentina' })
    matchId = result.matchId
    await startMatch.execute({ matchId })
  })

  describe('domain events', () => {
    it('always returns PointScored event', async () => {
      const { eventNames } = await scorePoint.execute({ matchId, scorer: 'team1' })
      expect(eventNames).toContain('PointScored')
      expect(eventNames).toHaveLength(1)
    })

    it('returns GameWon event when the game ends (noAd: 4 points)', async () => {
      for (let i = 0; i < 3; i++) {
        const { eventNames } = await scorePoint.execute({ matchId, scorer: 'team1' })
        expect(eventNames).toEqual(['PointScored'])
      }
      const { eventNames } = await scorePoint.execute({ matchId, scorer: 'team1' })
      expect(eventNames).toContain('PointScored')
      expect(eventNames).toContain('GameWon')
    })

    it('returns SetWon event when a set ends (6-0)', async () => {
      let lastOutput = { eventNames: [] as string[] }
      for (let g = 0; g < 5; g++) await winGame(scorePoint, matchId, 'team1')
      for (let i = 0; i < 3; i++) await scorePoint.execute({ matchId, scorer: 'team1' })
      lastOutput = await scorePoint.execute({ matchId, scorer: 'team1' })
      expect(lastOutput.eventNames).toContain('SetWon')
      expect(lastOutput.eventNames).toContain('GameWon')
    })

    it('returns MatchWon event when the match ends', async () => {
      await winSet(scorePoint, matchId, 'team1')
      for (let g = 0; g < 5; g++) await winGame(scorePoint, matchId, 'team1')
      for (let i = 0; i < 3; i++) await scorePoint.execute({ matchId, scorer: 'team1' })
      const { eventNames } = await scorePoint.execute({ matchId, scorer: 'team1' })
      expect(eventNames).toContain('MatchWon')
    })

    it('returns only events from the current point (queue is cleared between calls)', async () => {
      const first = await scorePoint.execute({ matchId, scorer: 'team1' })
      const second = await scorePoint.execute({ matchId, scorer: 'team1' })
      expect(first.eventNames).toEqual(['PointScored'])
      expect(second.eventNames).toEqual(['PointScored'])
    })
  })

  describe('state persistence', () => {
    it('persists updated match state after each point', async () => {
      await scorePoint.execute({ matchId, scorer: 'team1' })
      const match = await repository.findById(matchId)
      expect(match!.currentSet!.currentGame!.points.length).toBe(1)
    })

    it('accumulates points across multiple calls', async () => {
      await scorePoint.execute({ matchId, scorer: 'team1' })
      await scorePoint.execute({ matchId, scorer: 'team2' })
      await scorePoint.execute({ matchId, scorer: 'team1' })
      const match = await repository.findById(matchId)
      expect(match!.currentSet!.currentGame!.points.length).toBe(3)
    })

    it('advances to the next game after the current one ends', async () => {
      await winGame(scorePoint, matchId, 'team1')
      const match = await repository.findById(matchId)
      expect(match!.currentSet!.games.length).toBe(2)
      expect(match!.currentSet!.currentGame!.points.length).toBe(0)
    })

    it('advances to the next set after the current one ends', async () => {
      await winSet(scorePoint, matchId, 'team1')
      const match = await repository.findById(matchId)
      expect(match!.sets.length).toBe(2)
      expect(match!.sets[0].isFinished).toBe(true)
      expect(match!.currentSet).not.toBeNull()
    })

    it('marks match as finished when the last set is won', async () => {
      await winSet(scorePoint, matchId, 'team1')
      await winSet(scorePoint, matchId, 'team1')
      const match = await repository.findById(matchId)
      expect(match!.status).toBe('finished')
      expect(match!.winner).toBe('team1')
    })
  })

  describe('error cases', () => {
    it('throws when match does not exist', async () => {
      await expect(
        scorePoint.execute({ matchId: 'nonexistent', scorer: 'team1' }),
      ).rejects.toThrow('Match not found: nonexistent')
    })

    it('throws when match has not started yet', async () => {
      const { matchId: id } = await createMatch.execute({ team1Name: 'A', team2Name: 'B' })
      await expect(scorePoint.execute({ matchId: id, scorer: 'team1' })).rejects.toThrow(
        'The match is not in progress',
      )
    })

    it('throws when match is already finished', async () => {
      await winSet(scorePoint, matchId, 'team1')
      await winSet(scorePoint, matchId, 'team1')
      await expect(scorePoint.execute({ matchId, scorer: 'team1' })).rejects.toThrow(
        'The match is not in progress',
      )
    })
  })
})
