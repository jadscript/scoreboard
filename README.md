# Scoreboard

Real-time beach tennis scoreboard application built with React, TypeScript and DDD.

## Tech Stack

| | |
|---|---|
| **UI** | React 19, Tailwind CSS 4, TanStack Router |
| **API** | NestJS 11 (REST) |
| **Auth** | Keycloak 26.5.6 (custom Docker image) |
| **Language** | TypeScript 5.9 (strict + `erasableSyntaxOnly`) |
| **Frontend build** | Vite 8 |
| **Mobile** | Expo SDK 54, React Native 0.81 (`@scoreboard/mobile` — `apps/mobile`) |
| **Backend build** | NestJS CLI (webpack) |
| **Client database** | RxDB 16 + Dexie 4 (IndexedDB — matches/players local cache) |
| **API database** | PostgreSQL + Prisma 7 (`apps/backend` — schema `prisma/schema.prisma`, migrations at container start) |
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
│   ├── mobile/                # Expo app (React Native) (@scoreboard/mobile)
│   ├── backend/               # NestJS API (@scoreboard/backend)
│   └── auth/                  # Custom Keycloak image (@scoreboard/auth)
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

NestJS 11 REST API. Consumes `@scoreboard/core` via workspace dependency — path aliases in `tsconfig.json` resolve the TypeScript source directly without a compiled `dist/`. Relational data uses **Prisma** against PostgreSQL (`DATABASE_URL`).

```
apps/backend/
├── prisma/
│   ├── schema.prisma          # Models (e.g. Player), enums (Gender)
│   └── migrations/            # Versioned SQL — applied with migrate dev / migrate deploy
├── prisma.config.ts           # Prisma 7 configuration
└── src/
    ├── config/
    │   ├── app.config.ts          # Namespace "app" — port, NODE_ENV, CORS
    │   ├── database.config.ts     # Namespace "database" — DATABASE_URL
    │   └── validation.schema.ts   # Joi schema — validates envs at startup
    ├── prisma/                    # PrismaModule + PrismaService (adapter-pg)
    ├── generated/prisma/          # Generated client (prisma generate)
    ├── app.module.ts              # Root NestJS module
    ├── app.controller.ts
    ├── app.service.ts
    └── main.ts                    # Bootstrap — CORS, port, shutdown hooks
```

Docker image: `apps/backend/Dockerfile` — multi-stage build via `turbo prune @scoreboard/backend`; the runtime image runs **`prisma migrate deploy`** before starting the Node process so the database schema is up to date.

### `apps/auth` (`@scoreboard/auth`)

Custom Keycloak 26.5.6 Docker image with passwordless Email OTP authentication. Built entirely via Docker — no Node.js build step.

```
apps/auth/
├── Dockerfile                 # Production image (multi-stage with optional Maven build)
├── Dockerfile.local           # Development image (start-dev mode)
├── VERSION                    # Plain-text version (used by CI for git tags / GitHub Releases)
├── themes/                    # FreeMarker login/account/email themes (future)
└── providers/                 # Java SPI JARs (future custom providers)
```

This is **not** a Node.js package — it is not part of the pnpm workspace or Turborepo pipeline.

### `apps/mobile` (`@scoreboard/mobile`)

Expo + Expo Router. Same Turborepo tasks as other Node packages (`pnpm dev` / `build` / `check-types` / `lint` / `test`). CI `build` runs `expo export -p web` (output `dist/`). Store builds use [EAS](https://docs.expo.dev/build/introduction/) (`eas.json`, project id in `app.json` → `extra.eas`). Releases: **release-it** + `CHANGELOG.md` (tag `@scoreboard/mobile@X.Y.Z`), same automation as frontend/backend on push to `main`.

```bash
pnpm --filter @scoreboard/mobile dev    # Expo dev server
cd apps/mobile && pnpm run ios          # or android / web
```

**Bundled provider:** [keycloak-magic-link](https://github.com/p2-inc/keycloak-magic-link) v0.59 (Phase Two) — downloaded from Maven Central during Docker build. Provides the Email OTP authenticator and Magic Link authenticator.

### `apps/frontend`

```
apps/frontend/src/
├── infrastructure/
│   ├── env.ts                         # Joi validation — app crashes if envs are missing
│   ├── auth/
│   │   ├── keycloak.ts                # Keycloak singleton (reads validated env)
│   │   ├── AuthContext.ts             # React context + types (AuthUser, AuthContextValue)
│   │   └── KeycloakProvider.tsx       # AuthProvider — init, token refresh (3 layers), loading/error
│   └── persistence/
│       ├── database.ts                # RxDB singleton (IndexedDB via Dexie)
│       ├── match.schema.ts            # JSON Schema for the match collection
│       ├── match.serializer.ts        # Match ↔ MatchDocument (de)serialization
│       ├── rxdb-match.repository.ts   # IMatchRepository → RxDB + IndexedDB
│       └── rxdb-player.repository.ts  # IPlayerRepository → RxDB + IndexedDB
├── hooks/
│   ├── useScoreboard.ts           # keyboard input + score state (UI bridge)
│   └── useAuth.ts                 # access auth context (user, roles, logout)
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
        [Infrastructure: RxDB + IndexedDB (browser)]
                          │
        [Nest API + Prisma + PostgreSQL (server)]
```

On the **client**, data can persist across browser sessions in **IndexedDB** (via RxDB + Dexie): each `Match` is stored as a JSON document and rehydrated with `restore()`. The **backend** stores authoritative **Player** rows (and future relational data) in **PostgreSQL** via Prisma; the SPA talks to the API over HTTPS with a Bearer token (see `apps/backend/README.md` and `.cursor/rules/backend.mdc` for Prisma commands and Docker startup).

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

**Valid scopes:** `core`, `frontend`, `backend`, `mobile`, `auth`, `shared`, `ci`, `deps`, `release`

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
| `@scoreboard/mobile` | `@scoreboard/mobile@1.0.0` | `apps/mobile/.release-it.json` |
| `@scoreboard/auth` | `@scoreboard/auth@0.1.0` | `apps/auth/VERSION` |

A release is only triggered when there are commits since the last tag that touch the package directory. Node.js packages use `release-it` (auto-generates `CHANGELOG.md`). `@scoreboard/auth` uses a plain `VERSION` file + git tags + GitHub Releases (no Node.js tooling).

### Manual release

```bash
# @scoreboard/core only
cd packages/core && pnpm run release

# frontend only
cd apps/frontend && pnpm run release

# backend only
cd apps/backend && pnpm run release

# mobile (Expo) only
cd apps/mobile && pnpm run release

# auth (Keycloak) — bump VERSION file, then tag manually
cd apps/auth
# edit VERSION with the new version, commit, then:
git tag -a "@scoreboard/auth@$(cat VERSION)" -m "@scoreboard/auth v$(cat VERSION)"
git push origin "@scoreboard/auth@$(cat VERSION)"
```

## Frontend Configuration

The frontend uses Joi to validate environment variables at startup. The app **crashes immediately** with a descriptive error if any required variable is missing or invalid — no silent fallback.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_KEYCLOAK_URL` | **yes** | Keycloak base URL (e.g. `http://0.0.0.0:8080/`) |
| `VITE_KEYCLOAK_REALM` | **yes** | Keycloak realm name |
| `VITE_KEYCLOAK_CLIENT` | **yes** | Keycloak client ID for the frontend |

### Env file conventions

| File | Committed | Purpose |
|---|---|---|
| `.env.example` | yes | Template — reference for all variables |
| `.env` | **no** (gitignored) | Actual values for local development |

### Local setup

```bash
cd apps/frontend
cp .env.example .env
# edit .env with your Keycloak values
pnpm dev
```

### Authentication (Keycloak)

The entire application is protected by Keycloak using `onLoad: 'login-required'` — no route renders before the user is authenticated. Token refresh uses a three-layer strategy:

1. **Proactive interval** — `setInterval` every 60s calls `updateToken(70)`
2. **`onTokenExpired` callback** — reactive fallback calls `updateToken(30)`
3. **Visibility change** — refreshes when the browser tab regains focus

If the refresh token expires, the user is redirected to the Keycloak login page.

Use the `useAuth()` hook in any component:

```tsx
import { useAuth } from '../hooks/useAuth'

const { user, roles, hasRole, logout, token } = useAuth()
```

## Authentication Flow (Email OTP)

The app uses **passwordless Email OTP** authentication. Users enter their email, receive a 6-digit code, and enter it to log in. If the email doesn't match an existing user, Keycloak creates one automatically.

This is powered by the [keycloak-magic-link](https://github.com/p2-inc/keycloak-magic-link) extension (Email OTP authenticator) and emails are sent via **Resend** (SMTP gateway).

### Configuring Resend as email provider

[Resend](https://resend.com) is used to deliver OTP emails via its SMTP gateway. You need:

1. A [Resend account](https://resend.com/signup)
2. A [verified domain](https://resend.com/domains) (e.g. `yourdomain.com`)
3. An [API key](https://resend.com/api-keys)

Then configure SMTP in the Keycloak Admin Console:

1. Go to **Realm Settings > Email**
2. Fill in the fields:

| Setting | Value |
|---|---|
| From | `noreply@yourdomain.com` (must match your verified Resend domain) |
| From Display Name | `Scoreboard` (or any name you prefer) |
| Host | `smtp.resend.com` |
| Port | `587` (local) / `2587` (production — see note below) |
| Encryption | Enable **StartTLS** |
| Authentication | **Enabled** |
| Username | `resend` |
| Password | Your Resend API key (starts with `re_`) |

3. Click **Test connection** to verify that Keycloak can send emails through Resend
4. Save

> **Production (Railway / cloud providers):** Use port **`2587`** instead of `587`. Most cloud providers (Railway, Render, Fly.io, etc.) block outbound traffic on standard SMTP ports (25, 465, 587) to prevent spam. Resend's port `2587` is an alternative that bypasses this restriction. You will get a `SocketTimeoutException: Connect timed out` if the port is blocked.
>
> **Local development:** Port `587` with StartTLS works fine.

### Configuring the Magic Link authentication flow

After the first boot with the provider installed, set up the passwordless login flow.

**1. Create the flow**

1. Go to **Authentication > Flows**
2. Click **Create flow**
3. Name: `Email OTP Browser`, Type: `basic-flow`

**2. Add the steps**

Add executions (no sub-flow needed):

| Step | Type | Requirement |
|---|---|---|
| **Cookie** | execution | `ALTERNATIVE` |
| **Magic Link** | execution | `ALTERNATIVE` |

The structure should look like this:

```
Email OTP Browser
├── Cookie        (ALTERNATIVE)
└── Magic Link    (ALTERNATIVE)
```

**3. Configure Magic Link**

Click the gear icon on the **Magic Link** step and set:

| Option | Value |
|---|---|
| Force create user | **ON** — auto-registers users that don't exist |
| Allow magic link to be reusable | **OFF** (recommended for security) |

**4. Set as default**

1. Go to **Authentication > Bindings** (or **Realm Settings > Authentication**)
2. Set **Browser Flow** to `Email OTP Browser`
3. Save

**Flow behavior:** The user enters their email. If the user exists, a magic link is sent to their email. If the user does not exist and "Force create user" is ON, the user is created automatically and the magic link is sent. The user clicks the link and is authenticated.

> **Why Magic Link instead of Email OTP?** Keycloak's flow engine does not support mixing `REQUIRED` and `ALTERNATIVE` executions at the same level — alternative steps are silently ignored. The Email OTP authenticator requires a preceding Username Form step to collect the email, but Username Form only allows `REQUIRED` mode and rejects unknown users. The Magic Link authenticator has its own email form built-in and handles user creation natively, making it a simpler and more reliable solution.

## Infrastructure (Docker Compose)

### Development

Starts PostgreSQL and a custom Keycloak image (built from `apps/auth/Dockerfile.local`) locally. Credentials are hardcoded for convenience.

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
