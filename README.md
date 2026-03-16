# Scoreboard

Real-time beach tennis scoreboard application built with React, TypeScript and DDD.

## Tech Stack

| | |
|---|---|
| **UI** | React 19, Tailwind CSS 4, TanStack Router |
| **Language** | TypeScript 5.9 (strict + `erasableSyntaxOnly`) |
| **Build** | Vite 8 |
| **Database** | RxDB 16 + Dexie 4 (IndexedDB — persists across sessions) |
| **Tests** | Vitest 4 |
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
│   └── frontend/              # Vite app (React + UI)
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

**Valid scopes:** `core`, `frontend`, `shared`, `ci`, `deps`, `release`

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
| `scoreboard` (frontend) | `scoreboard@2.0.0` | `apps/frontend/.release-it.json` |

A release is only triggered when there are commits since the last tag that touch the package directory. Each package's `CHANGELOG.md` is generated automatically.

### Manual release

```bash
# @scoreboard/core only
cd packages/core && pnpm run release

# frontend only
cd apps/frontend && pnpm run release
```
