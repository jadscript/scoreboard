import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core'
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import type { RxDatabase, RxCollection, RxStorage } from 'rxdb'

addRxPlugin(RxDBMigrationSchemaPlugin)
import { matchSchema } from './match.schema'
import { playerSchema } from './player.schema'
import type { MatchDocument } from './match.serializer'
import type { PlayerDocument } from './player.schema'

type ScoreboardCollections = {
  matches: RxCollection<MatchDocument>
  players: RxCollection<PlayerDocument>
}

// RxDatabase<Collections> exposes each collection as a typed property (db.matches, db.players).
// Using a type alias instead of `interface extends RxDatabase` avoids conflicts with
// RxDatabase's internal string index signature.
export type ScoreboardDatabase = RxDatabase<ScoreboardCollections>

let _db: ScoreboardDatabase | null = null

export async function getDatabase(): Promise<ScoreboardDatabase> {
  if (_db) return _db

  let storage: RxStorage<unknown, unknown> = getRxStorageDexie()

  if (import.meta.env.DEV) {
    const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode')
    addRxPlugin(RxDBDevModePlugin)
    // Dev-mode requires a schema validator wrapping the storage (RxDB error DVM1)
    storage = wrappedValidateAjvStorage({ storage })
  }

  const db = await createRxDatabase<ScoreboardCollections>({
    name: 'scoreboard',
    storage,
    ignoreDuplicate: true,
  })

  await db.addCollections({
    matches: { schema: matchSchema },
    players: {
      schema: playerSchema,
      migrationStrategies: {
        // v0 → v1: name field added; derive a default from the email prefix
        1: (oldDoc: Record<string, unknown>) => ({
          ...oldDoc,
          name: String(oldDoc['email'] ?? '').split('@')[0],
        }),
      },
    },
  })

  _db = db
  return db
}
