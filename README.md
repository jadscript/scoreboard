# Scoreboard

Real-time beach tennis scoreboard application built with React, TypeScript and DDD.

## Tech Stack

| | |
|---|---|
| **UI** | React 19, Tailwind CSS 4, TanStack Router |
| **API** | NestJS 11 (REST) |
| **Language** | TypeScript 5.9 (strict + `erasableSyntaxOnly`) |
| **Frontend build** | Vite 8 |
| **Backend build** | NestJS CLI (webpack) |
| **Database** | RxDB 16 + Dexie 4 (IndexedDB — persists across sessions) |
| **Tests** | Vitest 4 (frontend/core) · Jest 30 (backend) |
| **Package manager** | pnpm workspaces |
| **Monorepo** | Turborepo |
| **CI/CD** | GitHub Actions + release-it + Conventional Commits |

## Getting Started

```bash
pnpm install
pnpm dev          # start development server (via turbo)
pnpm test         # run tests once (via turbo)
pnpm build        # production build (via turbo, with cache)
pnpm check-types  # type-check (via turbo, runs in parallel with build)
pnpm lint         # lint (via turbo)
```

## Monorepo Structure

```
scoreboard/
├── apps/
│   ├── frontend/              # Vite app (React + UI) (@scoreboard/frontend)
│   └── backend/               # NestJS API (@scoreboard/backend)
├── packages/
│   ├── core/                  # @scoreboard/core — DDD domain + application layer
│   └── shared/                # shared code across apps (future)
├── turbo.json                 # Turborepo task pipeline
└── pnpm-workspace.yaml        # pnpm workspace declaration
```

## Project Structure

### `packages/core` (`@scoreboard/core`)

Domain and application layer — pure TypeScript, no framework dependencies.

```
packages/core/src/
├── domain/                        # Domain layer — pure TS, no framework deps
│   ├── shared/
│   │   ├── entity.base.ts             # Entity<TProps> base class
│   │   ├── aggregate-root.base.ts     # AggregateRoot<TProps> with event queue
│   │   ├── domain-event.interface.ts
│   │   └── types.ts                   # PointScorer, MatchStatus, GameType
│   ├── value-objects/
│   │   ├── team.vo.ts                 # Team (id + name)
│   │   └── match-config.vo.ts         # bestOf, noAd, finalSetSuperTiebreak
│   ├── events/
│   │   ├── point-scored.event.ts
│   │   ├── game-won.event.ts
│   │   ├── set-won.event.ts
│   │   └── match-won.event.ts
│   ├── point.entity.ts                # scorer + scoredAt
│   ├── game.entity.ts                 # regular / tiebreak / super-tiebreak
│   ├── set.entity.ts                  # manages games, tiebreak at 6-6
│   └── match.aggregate.ts             # aggregate root, fires domain events
├── application/                   # Application layer — CQRS use cases
│   ├── shared/
│   │   ├── command-handler.interface.ts  # ICommandHandler<TInput, TOutput>
│   │   ├── query-handler.interface.ts    # IQueryHandler<TInput, TOutput>
│   │   └── match.dto.ts                  # MatchDto, SetDto, GameDto, TeamDto
│   ├── commands/
│   │   ├── create-match/              # CreateMatch command + handler
│   │   ├── start-match/               # StartMatch command + handler
│   │   └── score-point/               # ScorePoint command + handler
│   └── queries/
│       └── get-match/                 # GetMatch query + handler (Match → MatchDto)
└── infrastructure/
    └── database/
        ├── match-repository.interface.ts  # IMatchRepository (port)
        └── player-repository.interface.ts # IPlayerRepository (port)
```

### `apps/backend` (`@scoreboard/backend`)

NestJS 11 REST API. Consumes `@scoreboard/core` via workspace dependency — path aliases in `tsconfig.json` resolve the TypeScript source directly without a compiled `dist/`.

```
apps/backend/src/
├── config/
│   ├── app.config.ts          # Namespace "app" — port, NODE_ENV, CORS
│   ├── database.config.ts     # Namespace "database" — DATABASE_URL
│   └── validation.schema.ts   # Joi schema — validates envs at startup
├── app.module.ts              # Root NestJS module (imports ConfigModule globally)
├── app.controller.ts          # Root controller
├── app.service.ts             # Root service
└── main.ts                    # Bootstrap — CORS + port via ConfigService
```

Docker image: `apps/backend/Dockerfile` — multi-stage build via `turbo prune @scoreboard/backend`.

### `apps/frontend`

```
apps/frontend/src/
├── infrastructure/
│   └── persistence/
│       ├── database.ts                # RxDB singleton (IndexedDB via Dexie)
│       ├── match.schema.ts            # JSON Schema for the match collection
│       ├── match.serializer.ts        # Match ↔ MatchDocument (de)serialization
│       ├── rxdb-match.repository.ts   # IMatchRepository → RxDB + IndexedDB
│       └── rxdb-player.repository.ts  # IPlayerRepository → RxDB + IndexedDB
├── hooks/
│   └── useScoreboard.ts           # keyboard input + score state (UI bridge)
├── pages/
│   ├── players/                   # Player management
│   ├── Login.tsx
│   └── Scoreboard.tsx
├── router.tsx                     # TanStack Router route tree
├── main.tsx
└── index.css                      # @import "tailwindcss" + bare resets
```

## Architecture

The project follows **DDD (Domain-Driven Design)** with **Clean Architecture** layers:

```
[UI / Pages]  →  [Application / Use Cases]  →  [Domain]
                          ↑                          ↑
                  IMatchRepository (port)       pure TypeScript
                          ↑
                  [Infrastructure: RxDB + IndexedDB]
```

Data persists across browser sessions in **IndexedDB** (via RxDB + Dexie). Each `Match` is stored as a single JSON document and fully reconstructed as a domain aggregate on load using `restore()` factory methods.

### Domain Entities

| Class | Role |
|---|---|
| `Match` | Aggregate root. Only public mutation surface. |
| `SetEntity` | Manages games within a set. |
| `Game` | Tracks points, evaluates winner per game type. |
| `Point` | Immutable record of a scored point. |
| `Team` | Value object — id + name. |
| `MatchConfig` | Value object — `bestOf`, `noAd`, `finalSetSuperTiebreak`. |

### Using the Domain via Application Layer (CQRS)

```typescript
// Initialize database and repository (infrastructure layer)
import { getDatabase } from './infrastructure/persistence/database'
import { RxDBMatchRepository } from './infrastructure/persistence/rxdb-match.repository'

const db = await getDatabase()
const repository = new RxDBMatchRepository(db)

// Commands
const createMatch = new CreateMatchHandler(repository)
const { matchId } = await createMatch.execute({
  team1Name: 'Brazil',
  team2Name: 'Argentina',
  config: { bestOf: 3, noAd: true, finalSetSuperTiebreak: true },
})

const startMatch = new StartMatchHandler(repository)
await startMatch.execute({ matchId })

const scorePoint = new ScorePointHandler(repository)
const { eventNames } = await scorePoint.execute({ matchId, scorer: 'team1' })
// eventNames → ['PointScored'] or ['PointScored', 'GameWon', ...]

// Query
const getMatch = new GetMatchHandler(repository)
const matchDto = await getMatch.execute({ matchId })
// matchDto.currentSet.currentGame.score → { team1: '15', team2: '0' }
```

### Domain Events

After every `match.scorePoint()` call, collect events with `match.pullDomainEvents()`:

| Event | Fired when |
|---|---|
| `PointScored` | Every point |
| `GameWon` | A game ends |
| `SetWon` | A set ends |
| `MatchWon` | The match ends |

## Beach Tennis Scoring Rules

### Game
- Regular scoring: `0 → 15 → 30 → 40 → Win`
- At deuce (40-40): need 2 consecutive points — or **noAd** (next point wins)
- Tiebreak: first to **7**, win by **2**
- Super tiebreak: first to **10**, win by **2**

### Set
- First to **6 games**, win by **2** (max 7-5 without tiebreak)
- At **6-6**: standard 7-point tiebreak → final score is 7-6
- Super tiebreak set: entire set is one super-tiebreak game (used as deciding set)

### Match
- **bestOf 3** by default → first to **2 sets** wins
- Deciding set is a **super tiebreak** by default (`finalSetSuperTiebreak: true`)

## TypeScript Conventions

- `erasableSyntaxOnly: true` — no parameter properties, no regular enums
- `verbatimModuleSyntax: true` — `import type` for type-only imports
- All domain classes use the **Props pattern**:
  - `interface XxxProps { ... }` defines the state shape
  - `private constructor(props: XxxProps, id?: string)` — no parameter properties
  - `static create(...)` and `static restore(...)` are the only entry points

## Testing

Tests live in `__tests__/` folders alongside the files they test, inside `packages/core/src/`.
Run with `pnpm test` (runs via Turborepo across all workspace packages).

Coverage includes: all value objects, all entities, the aggregate root, domain events, and all edge cases of beach tennis scoring rules.

## CI/CD

### Workflows

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | Pull Request → `main` | Validates commits, `check-types`, `test`, `build` |
| `release.yml` | Push → `main` | Runs full CI, then detects changes and releases per package |

### Conventional Commits

This repository follows [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description
```

**Valid scopes:** `core`, `frontend`, `backend`, `shared`, `ci`, `deps`, `release`

| Type | Example | Version bump |
|---|---|---|
| `feat` | `feat(core): add super tiebreak` | minor |
| `fix` | `fix(frontend): correct score display` | patch |
| `feat!` / `BREAKING CHANGE` | `feat(core)!: redesign match api` | major |
| `chore`, `docs`, `ci`, `test` | `chore(deps): update vitest` | no release |

### Automatic releases

Each package has independent tags and GitHub Releases:

| Package | Tag example | Config file |
|---|---|---|
| `@scoreboard/core` | `@scoreboard/core@1.2.3` | `packages/core/.release-it.json` |
| `@scoreboard/frontend` (frontend) | `@scoreboard/frontend@2.0.0` | `apps/frontend/.release-it.json` |
| `@scoreboard/backend` | `@scoreboard/backend@1.0.0` | `apps/backend/.release-it.json` |

A release is only triggered when there are commits since the last tag that touch the package directory. Each package's `CHANGELOG.md` is generated automatically.

### Manual release

```bash
# @scoreboard/core only
cd packages/core && pnpm run release

# frontend only
cd apps/frontend && pnpm run release

# backend only
cd apps/backend && pnpm run release
```

## Infrastructure (Docker Compose)

### Development

Starts PostgreSQL and Keycloak locally. Credentials are hardcoded for convenience.

```bash
docker compose up -d          # start
docker compose down           # stop (keeps data volume)
docker compose down -v        # stop + wipe volumes
```

| Service | URL |
|---|---|
| PostgreSQL | `localhost:5432` |
| Keycloak admin console | `http://localhost:8080` (admin / admin) |

### Production

`docker-compose.prod.yml` is hardened for production:

- No credentials in the file — all loaded from environment variables
- PostgreSQL not exposed to the host — only reachable via the internal Docker network
- Keycloak runs in `start` (production) mode with `KC_PROXY_HEADERS=xforwarded` for reverse proxy support
- Resource limits (`memory`, `cpus`) and `json-file` log rotation on every service
- Explicit `internal` (postgres-only) and `public` (keycloak + proxy) networks

```bash
# 1. Copy the example and fill in real secrets
cp .env.prod.example .env.prod
# edit .env.prod

# 2. Start
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

> `.env.prod` is gitignored. Never commit it.

**Required variables** (see `.env.prod.example` for full list):

| Variable | Description |
|---|---|
| `POSTGRES_USER` | Database superuser |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Main app database name |
| `KEYCLOAK_ADMIN` | Keycloak bootstrap admin user |
| `KEYCLOAK_ADMIN_PASSWORD` | Keycloak bootstrap admin password |
| `KC_HOSTNAME` | Public hostname for Keycloak (e.g. `auth.example.com`) |

## Backend Configuration

The backend uses `@nestjs/config` with Joi schema validation. The app **fails fast at startup** if a required env var is missing or invalid.

### Environment variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `NODE_ENV` | `development` | no | `development` \| `production` \| `test` |
| `PORT` | `3000` | no | HTTP port |
| `CORS_ENABLED` | `true` | no | Enable/disable CORS globally |
| `CORS_ORIGINS` | `http://localhost:5173` | no | Comma-separated list of allowed origins |
| `DATABASE_URL` | — | **yes** | PostgreSQL connection string |

### Env file conventions

| File | Committed | Purpose |
|---|---|---|
| `.env.example` | yes | Template — reference for all variables |
| `.env.development` | yes | Safe development defaults |
| `.env.development.local` | no (gitignored) | Local overrides |
| `.env.production` | no | Injected by CI/CD or container orchestration |

### Local setup

```bash
# Option A — use committed development defaults as-is
cd apps/backend
pnpm dev

# Option B — override specific values locally
cp apps/backend/.env.development apps/backend/.env.development.local
# edit .env.development.local with your local values
```
