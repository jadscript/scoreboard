import type { RxJsonSchema } from 'rxdb'
import type { MatchDocument } from './match.serializer'

const playerSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    gender: { type: 'string', enum: ['male', 'female', 'unknown'] },
    whatsapp: { type: ['string', 'null'] },
    photoUrl: { type: 'string' },
  },
  required: ['id', 'email', 'gender'],
}

const teamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    players: { type: 'array', items: playerSchema },
  },
  required: ['id', 'name', 'players'],
}

export const matchSchema: RxJsonSchema<MatchDocument> = {
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    team1: teamSchema,
    team2: teamSchema,
    config: {
      type: 'object',
      properties: {
        bestOf: { type: 'number', enum: [1, 3, 5] },
        noAd: { type: 'boolean' },
        finalSetSuperTiebreak: { type: 'boolean' },
      },
      required: ['bestOf', 'noAd', 'finalSetSuperTiebreak'],
    },
    matchType: {
      type: 'string',
      enum: ['singles', 'doubles_male', 'doubles_female', 'doubles_mixed'],
    },
    status: { type: 'string', enum: ['not_started', 'in_progress', 'finished'] },
    winner: { type: 'string', enum: ['team1', 'team2'] },
    sets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          config: { type: 'object' },
          winner: { type: 'string' },
          games: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  required: ['id', 'team1', 'team2', 'config', 'status', 'sets'],
}
