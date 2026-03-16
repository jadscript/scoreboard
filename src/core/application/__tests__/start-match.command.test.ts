import { describe, it, expect, beforeEach } from 'vitest'
import { CreateMatchHandler } from '../commands/create-match/create-match.command'
import { StartMatchHandler } from '../commands/start-match/start-match.command'
import { InMemoryMatchRepository } from './helpers/in-memory-match.repository'
import { InMemoryPlayerRepository } from './helpers/in-memory-player.repository'

describe('StartMatchHandler', () => {
  let repository: InMemoryMatchRepository
  let createMatch: CreateMatchHandler
  let startMatch: StartMatchHandler

  beforeEach(() => {
    repository = new InMemoryMatchRepository()
    createMatch = new CreateMatchHandler(repository, new InMemoryPlayerRepository())
    startMatch = new StartMatchHandler(repository)
  })

  it('transitions match status to in_progress', async () => {
    const { matchId } = await createMatch.execute({ team1Name: 'A', team2Name: 'B' })
    await startMatch.execute({ matchId })
    const match = await repository.findById(matchId)
    expect(match!.status).toBe('in_progress')
  })

  it('creates the first set when started', async () => {
    const { matchId } = await createMatch.execute({ team1Name: 'A', team2Name: 'B' })
    await startMatch.execute({ matchId })
    const match = await repository.findById(matchId)
    expect(match!.sets.length).toBe(1)
    expect(match!.currentSet).not.toBeNull()
  })

  it('creates the first game inside the first set', async () => {
    const { matchId } = await createMatch.execute({ team1Name: 'A', team2Name: 'B' })
    await startMatch.execute({ matchId })
    const match = await repository.findById(matchId)
    expect(match!.currentSet!.currentGame).not.toBeNull()
    expect(match!.currentSet!.currentGame!.type).toBe('regular')
  })

  it('persists the started match to the repository', async () => {
    const { matchId } = await createMatch.execute({ team1Name: 'A', team2Name: 'B' })
    await startMatch.execute({ matchId })
    const match = await repository.findById(matchId)
    expect(match!.status).toBe('in_progress')
  })

  it('throws when match does not exist', async () => {
    await expect(startMatch.execute({ matchId: 'nonexistent-id' })).rejects.toThrow(
      'Match not found: nonexistent-id',
    )
  })

  it('throws when match is already started', async () => {
    const { matchId } = await createMatch.execute({ team1Name: 'A', team2Name: 'B' })
    await startMatch.execute({ matchId })
    await expect(startMatch.execute({ matchId })).rejects.toThrow('The match has already started')
  })
})
