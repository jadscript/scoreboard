import type { MatchStatus, PointScorer, GameType, Gender, MatchType } from '../../core/domain/shared/types'
import { Match } from '../../core/domain/match.aggregate'
import { SetEntity } from '../../core/domain/set.entity'
import { Game } from '../../core/domain/game.entity'
import { Point } from '../../core/domain/point.entity'
import { Player } from '../../core/domain/player.entity'
import { Team } from '../../core/domain/value-objects/team.vo'
import { MatchConfig } from '../../core/domain/value-objects/match-config.vo'

// ---------------------------------------------------------------------------
// Plain JSON types stored in RxDB / IndexedDB
// ---------------------------------------------------------------------------

export interface PlayerDocument {
  id: string
  name: string
  email: string
  gender: Gender
  whatsapp: string
  photoUrl: string | null
}

export interface TeamDocument {
  id: string
  name: string
  players: PlayerDocument[]
}

export interface PointDocument {
  id: string
  scorer: PointScorer
  scoredAt: string
}

export interface GameDocument {
  id: string
  type: GameType
  noAd: boolean
  winner: PointScorer | null
  points: PointDocument[]
}

export interface SetDocument {
  id: string
  config: { noAd: boolean; isSuperTiebreak: boolean }
  winner: PointScorer | null
  games: GameDocument[]
}

export interface MatchDocument {
  id: string
  team1: TeamDocument
  team2: TeamDocument
  config: { bestOf: 1 | 3 | 5; noAd: boolean; finalSetSuperTiebreak: boolean }
  matchType: MatchType | null
  status: MatchStatus
  winner: PointScorer | null
  sets: SetDocument[]
}

// ---------------------------------------------------------------------------
// Serialize: domain aggregate → plain JSON
// ---------------------------------------------------------------------------

export function serializeMatch(match: Match): MatchDocument {
  return {
    id: match.id,
    team1: serializeTeam(match.team1),
    team2: serializeTeam(match.team2),
    config: {
      bestOf: match.config.bestOf,
      noAd: match.config.noAd,
      finalSetSuperTiebreak: match.config.finalSetSuperTiebreak,
    },
    matchType: match.matchType,
    status: match.status,
    winner: match.winner,
    sets: match.sets.map(serializeSet),
  }
}

function serializeTeam(team: Team): TeamDocument {
  return {
    id: team.id,
    name: team.name,
    players: team.players.map(serializePlayer),
  }
}

function serializePlayer(player: Player): PlayerDocument {
  return {
    id: player.id,
    name: player.name,
    email: player.email,
    gender: player.gender,
    whatsapp: player.whatsapp,
    photoUrl: player.photoUrl,
  }
}

function serializeSet(set: SetEntity): SetDocument {
  return {
    id: set.id,
    config: { noAd: set.noAd, isSuperTiebreak: set.isSuperTiebreak },
    winner: set.winner,
    games: set.games.map(serializeGame),
  }
}

function serializeGame(game: Game): GameDocument {
  return {
    id: game.id,
    type: game.type,
    noAd: game.noAd,
    winner: game.winner,
    points: game.points.map(serializePoint),
  }
}

function serializePoint(point: Point): PointDocument {
  return {
    id: point.id,
    scorer: point.scorer,
    scoredAt: point.scoredAt.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Deserialize: plain JSON → domain aggregate
// ---------------------------------------------------------------------------

export function deserializeMatch(doc: MatchDocument): Match {
  const team1 = deserializeTeam(doc.team1)
  const team2 = deserializeTeam(doc.team2)
  const config = MatchConfig.create(doc.config)
  const sets = doc.sets.map(deserializeSet)

  return Match.restore(
    doc.id,
    team1,
    team2,
    config,
    sets,
    doc.status,
    doc.winner,
    doc.matchType ?? null,
  )
}

function deserializeTeam(doc: TeamDocument): Team {
  const players = (doc.players ?? []).map(deserializePlayer)
  return Team.restore(doc.id, doc.name, players)
}

function deserializePlayer(doc: PlayerDocument): Player {
  return Player.restore(doc.id, doc.name, doc.email, doc.gender, doc.whatsapp, doc.photoUrl)
}

function deserializeSet(doc: SetDocument): SetEntity {
  const games = doc.games.map(deserializeGame)
  return SetEntity.restore(doc.id, doc.config, games, doc.winner)
}

function deserializeGame(doc: GameDocument): Game {
  const points = doc.points.map(deserializePoint)
  return Game.restore(doc.id, doc.type, doc.noAd, points, doc.winner)
}

function deserializePoint(doc: PointDocument): Point {
  return Point.restore(doc.id, doc.scorer, new Date(doc.scoredAt))
}
