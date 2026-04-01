import { describe, it, expect, beforeEach } from 'vitest'
import { CreateMatchHandler } from '../commands/create-match/create-match.command'
import { StartMatchHandler } from '../commands/start-match/start-match.command'
import { ScorePointHandler } from '../commands/score-point/score-point.command'
import { GetMatchHandler } from '../queries/get-match/get-match.query'
import { InMemoryMatchRepository } from './helpers/in-memory-match.repository'
import { InMemoryPlayerRepository } from './helpers/in-memory-player.repository'
import { Player } from '../../domain/player.entity'

async function winGame(
  handler: ScorePointHandler,
  matchId: string,
  scorer: 'team1' | 'team2',
): Promise<void> {
  for (let i = 0; i < 4; i++) await handler.execute({ matchId, scorer })
}

async function winSet(
  handler: ScorePointHandler,
  matchId: string,
  scorer: 'team1' | 'team2',
): Promise<void> {
  for (let g = 0; g < 6; g++) await winGame(handler, matchId, scorer)
}

describe('GetMatchHandler', () => {
  let repository: InMemoryMatchRepository
  let createMatch: CreateMatchHandler
  let startMatch: StartMatchHandler
  let scorePoint: ScorePointHandler
  let getMatch: GetMatchHandler
  let matchId: string

  beforeEach(async () => {
    repository = new InMemoryMatchRepository()
    createMatch = new CreateMatchHandler(repository, new InMemoryPlayerRepository())
    startMatch = new StartMatchHandler(repository)
    scorePoint = new ScorePointHandler(repository)
    getMatch = new GetMatchHandler(repository)

    const result = await createMatch.execute({ team1Name: 'Brazil', team2Name: 'Argentina' })
    matchId = result.matchId
  })

  describe('error cases', () => {
    it('throws when match does not exist', async () => {
      await expect(getMatch.execute({ matchId: 'nonexistent' })).rejects.toThrow(
        'Match not found: nonexistent',
      )
    })
  })

  describe('player and matchType mapping', () => {
    it('returns matchType null when no players are provided', async () => {
      const dto = await getMatch.execute({ matchId })
      expect(dto.matchType).toBeNull()
      expect(dto.team1.players).toHaveLength(0)
    })

    it('returns matchType and player data when players are associated', async () => {
      const playerRepo = new InMemoryPlayerRepository()
      const p1 = Player.create('Alice', 'a@example.com', 'male', '+1')
      const p2 = Player.create('Bob', 'b@example.com', 'female', '+2')
      await playerRepo.save(p1)
      await playerRepo.save(p2)

      const handlerWithPlayers = new CreateMatchHandler(repository, playerRepo)
      const { matchId: mid } = await handlerWithPlayers.execute({
        team1Name: 'A',
        team2Name: 'B',
        team1PlayerIds: [p1.id],
        team2PlayerIds: [p2.id],
      })
      const dto = await getMatch.execute({ matchId: mid })
      expect(dto.matchType).toBe('singles')
      expect(dto.team1.players).toHaveLength(1)
      expect(dto.team1.players[0].userId).toBe('a@example.com')
      expect(dto.team1.players[0].gender).toBe('male')
      expect(dto.team2.players[0].userId).toBe('b@example.com')
    })
  })

  describe('MatchDto shape', () => {
    it('returns the correct team names and ids', async () => {
      const dto = await getMatch.execute({ matchId })
      expect(dto.team1.name).toBe('Brazil')
      expect(dto.team2.name).toBe('Argentina')
      expect(typeof dto.team1.id).toBe('string')
      expect(typeof dto.team2.id).toBe('string')
    })

    it('returns the match id', async () => {
      const dto = await getMatch.execute({ matchId })
      expect(dto.id).toBe(matchId)
    })

    it('returns not_started status before start with no sets', async () => {
      const dto = await getMatch.execute({ matchId })
      expect(dto.status).toBe('not_started')
      expect(dto.sets).toHaveLength(0)
      expect(dto.currentSet).toBeNull()
      expect(dto.winner).toBeNull()
    })

    it('returns in_progress status and active set after start', async () => {
      await startMatch.execute({ matchId })
      const dto = await getMatch.execute({ matchId })
      expect(dto.status).toBe('in_progress')
      expect(dto.sets).toHaveLength(1)
      expect(dto.currentSet).not.toBeNull()
    })

    it('returns the initial set score as 0-0', async () => {
      await startMatch.execute({ matchId })
      const dto = await getMatch.execute({ matchId })
      expect(dto.setScore).toEqual({ team1: 0, team2: 0 })
      expect(dto.currentSet!.score).toEqual({ team1: 0, team2: 0 })
    })
  })

  describe('game score mapping', () => {
    beforeEach(() => startMatch.execute({ matchId }))

    it('returns 0-0 score before any point', async () => {
      const dto = await getMatch.execute({ matchId })
      expect(dto.currentSet!.currentGame!.score).toEqual({ team1: '0', team2: '0' })
    })

    it('returns 15-0 after one point for team1', async () => {
      await scorePoint.execute({ matchId, scorer: 'team1' })
      const dto = await getMatch.execute({ matchId })
      expect(dto.currentSet!.currentGame!.score).toEqual({ team1: '15', team2: '0' })
    })

    it('returns 15-15 after one point each', async () => {
      await scorePoint.execute({ matchId, scorer: 'team1' })
      await scorePoint.execute({ matchId, scorer: 'team2' })
      const dto = await getMatch.execute({ matchId })
      expect(dto.currentSet!.currentGame!.score).toEqual({ team1: '15', team2: '15' })
    })

    it('returns 30-15 after two points for team1 and one for team2', async () => {
      await scorePoint.execute({ matchId, scorer: 'team1' })
      await scorePoint.execute({ matchId, scorer: 'team1' })
      await scorePoint.execute({ matchId, scorer: 'team2' })
      const dto = await getMatch.execute({ matchId })
      expect(dto.currentSet!.currentGame!.score).toEqual({ team1: '30', team2: '15' })
    })

    it('returns game type as regular for a standard game', async () => {
      const dto = await getMatch.execute({ matchId })
      expect(dto.currentSet!.currentGame!.type).toBe('regular')
      expect(dto.currentSet!.currentGame!.isFinished).toBe(false)
    })
  })

  describe('set score mapping', () => {
    beforeEach(() => startMatch.execute({ matchId }))

    it('updates set score after a game is won', async () => {
      await winGame(scorePoint, matchId, 'team1')
      const dto = await getMatch.execute({ matchId })
      expect(dto.currentSet!.score).toEqual({ team1: 1, team2: 0 })
    })

    it('marks finished game with correct winner', async () => {
      await winGame(scorePoint, matchId, 'team1')
      const dto = await getMatch.execute({ matchId })
      expect(dto.currentSet!.games[0].winner).toBe('team1')
      expect(dto.currentSet!.games[0].isFinished).toBe(true)
    })

    it('updates match set score after a set is won', async () => {
      await winSet(scorePoint, matchId, 'team1')
      const dto = await getMatch.execute({ matchId })
      expect(dto.setScore).toEqual({ team1: 1, team2: 0 })
    })

    it('includes all sets in the sets array', async () => {
      await winSet(scorePoint, matchId, 'team1')
      const dto = await getMatch.execute({ matchId })
      expect(dto.sets).toHaveLength(2)
      expect(dto.sets[0].isFinished).toBe(true)
      expect(dto.sets[0].winner).toBe('team1')
      expect(dto.sets[1].isFinished).toBe(false)
    })
  })

  describe('super tiebreak set', () => {
    it('flags the deciding set as isSuperTiebreak when config enables it', async () => {
      await startMatch.execute({ matchId })
      await winSet(scorePoint, matchId, 'team1')
      await winSet(scorePoint, matchId, 'team2')
      const dto = await getMatch.execute({ matchId })
      expect(dto.sets).toHaveLength(3)
      expect(dto.sets[2].isSuperTiebreak).toBe(true)
      expect(dto.currentSet!.isSuperTiebreak).toBe(true)
      expect(dto.currentSet!.currentGame!.type).toBe('super-tiebreak')
    })
  })

  describe('finished match', () => {
    it('returns finished status and winner after match ends', async () => {
      await startMatch.execute({ matchId })
      await winSet(scorePoint, matchId, 'team1')
      await winSet(scorePoint, matchId, 'team1')
      const dto = await getMatch.execute({ matchId })
      expect(dto.status).toBe('finished')
      expect(dto.winner).toBe('team1')
      expect(dto.currentSet).toBeNull()
    })

    it('returns correct set score when match is finished 2-0', async () => {
      await startMatch.execute({ matchId })
      await winSet(scorePoint, matchId, 'team1')
      await winSet(scorePoint, matchId, 'team1')
      const dto = await getMatch.execute({ matchId })
      expect(dto.setScore).toEqual({ team1: 2, team2: 0 })
    })

    it('returns correct set score when match is finished 2-1', async () => {
      await startMatch.execute({ matchId })
      await winSet(scorePoint, matchId, 'team1')
      await winSet(scorePoint, matchId, 'team2')
      for (let i = 0; i < 10; i++) {
        await scorePoint.execute({ matchId, scorer: 'team1' })
      }
      const dto = await getMatch.execute({ matchId })
      expect(dto.status).toBe('finished')
      expect(dto.winner).toBe('team1')
      expect(dto.setScore).toEqual({ team1: 2, team2: 1 })
    })
  })
})
