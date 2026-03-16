import type { RxJsonSchema } from 'rxdb'
import type { Gender } from '../../core/domain/player.entity'

export interface PlayerDocument {
  id: string
  name: string
  email: string
  gender: Gender
  whatsapp: string
  photoUrl: string | null
}

export const playerSchema: RxJsonSchema<PlayerDocument> = {
  version: 1,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    name: { type: 'string' },
    email: { type: 'string' },
    gender: { type: 'string', enum: ['male', 'female'] },
    whatsapp: { type: 'string' },
    photoUrl: { type: 'string' },
  },
  required: ['id', 'name', 'email', 'gender', 'whatsapp'],
}
