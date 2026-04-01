# @scoreboard/backend

NestJS 11 REST API for the Scoreboard monorepo. Domain logic lives in `@scoreboard/core`.

## Environment variables

Configuration is validated with **Joi** at startup (`src/config/validation.schema.ts`). If a required variable is missing, the process exits with an error.

Copy `.env.example` to `.env` / `.env.development.local` and fill in values. Full tables and semantics: [`.cursor/rules/backend.mdc`](../../.cursor/rules/backend.mdc).

| Group | Variables |
| --- | --- |
| App | `NODE_ENV`, `PORT`, `CORS_ENABLED`, `CORS_ORIGINS` |
| Database | `DATABASE_URL` |
| Keycloak | `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `KEYCLOAK_POLICY_ENFORCEMENT`, `KEYCLOAK_TOKEN_VALIDATION` |

Use `ConfigService.get<'namespace'>('namespace')` (e.g. `app`, `database`, `auth`) — do not read `process.env` in application code.

## Prisma (PostgreSQL)

Schema: `prisma/schema.prisma`. Migrations: `prisma/migrations/` (commit all new migration folders). Connection string: **`DATABASE_URL`** (required).

| Task | Command (from `apps/backend`) |
| --- | --- |
| Regenerate client after schema edits | `pnpm run prisma:generate` |
| Create/apply migrations in development | `pnpm run prisma:migrate` (`prisma migrate dev`) |
| Apply pending migrations (CI / production) | `pnpm run prisma:deploy` (`prisma migrate deploy`) |

`pnpm run build` runs **`prisma generate`** before `nest build`. The generated client is emitted under `src/generated/prisma/` (see `schema.prisma` generator `output`).

### Creating a new migration (development)

1. Ensure **PostgreSQL is running** and **`DATABASE_URL`** points at the database you want to migrate (see `.env.development` / `.env.development.local`).
2. Edit **`prisma/schema.prisma`** (add or change models, fields, enums, indexes, etc.).
3. From **`apps/backend`**, run:

   ```bash
   cd apps/backend
   pnpm exec prisma migrate dev --name short_description_of_change
   ```

   Equivalent: `pnpm run prisma:migrate -- --name short_description_of_change`.

   Example: `pnpm exec prisma migrate dev --name add_match_table`.

   Prisma will diff the schema against the current database, generate a new folder under **`prisma/migrations/<timestamp>_<name>/`** with `migration.sql`, apply it to the DB, and run **`prisma generate`**.

4. **Commit** the new migration folder together with any `schema.prisma` / code changes. Never edit applied migration SQL in shared branches unless you coordinate a fix migration.

If you only need to refresh the client without a migration (e.g. comments or non-DB metadata), use `pnpm run prisma:generate`.

### Applying migrations

| Situation | What to run | Notes |
| --- | --- | --- |
| **Local dev** (you just created a migration) | Already done by `migrate dev` | Same command also applies pending migrations from teammates after `git pull`. |
| **Local / shared DB** without creating migrations | `pnpm run prisma:deploy` | Applies every pending folder in `prisma/migrations/`; safe and non-interactive. |
| **Staging / production host** | `pnpm run prisma:deploy` with production **`DATABASE_URL`** | Run from CI, a release task, or manually; same as Docker behavior below. |
| **Docker** | Automatic | Image entrypoint runs `prisma migrate deploy` before starting the API. |

**Docker:** the production image runs `./node_modules/.bin/prisma migrate deploy` **before** `node dist/main.js`, so Postgres must be reachable at container start. See `.cursor/rules/backend.mdc` for full detail.

## Keycloak (authentication)

The API uses [`nest-keycloak-connect`](https://github.com/ferrerojosh/nest-keycloak-connect) with [`keycloak-connect`](https://github.com/keycloak/keycloak-nodejs-connect). `AuthModule` registers global guards (`AuthGuard`, `ResourceGuard`, `RoleGuard`). Routes are **protected by default**; use `@Public()` from `nest-keycloak-connect` on handlers that must stay anonymous (e.g. `GET /`).

Clients (including the Vite frontend) must send `Authorization: Bearer <access_token>` for protected routes.

### `api-cli` Client in Keycloak (API / resource server setup)

The frontend continues to use the public SPA client (`VITE_KEYCLOAK_CLIENT`, e.g., `web-cli`). The backend must use a separate, confidential client called **`api-cli`** in Keycloak, with client authentication enabled and the **Client secret** copied to `KEYCLOAK_CLIENT_SECRET`.

Quick steps (full details in [backend.mdc](../../.cursor/rules/backend.mdc), section **Keycloak client `api-cli` setup**):

1. In Keycloak Admin, select the correct realm (`KEYCLOAK_REALM`).
2. Go to **Clients** → **Create client** → set Client ID to **`api-cli`**.
3. Enable **Client authentication** (confidential client) and save.
4. Open the **Credentials** tab, copy the **Client secret**, and set it as `KEYCLOAK_CLIENT_SECRET` in your backend environment.
5. In the backend configuration, set `KEYCLOAK_CLIENT_ID=api-cli` and ensure all other `KEYCLOAK_*` variables are correctly set for the server/realm.

The `api-cli` client is used by the Node adapter to validate tokens for API requests; browser logins for users continue to use the SPA client.

## Scripts

```bash
pnpm install          # from monorepo root
pnpm run dev          # watch mode
pnpm run build
pnpm run check-types
pnpm run test
pnpm run test:e2e     # loads test/jest-e2e.setup.ts for required env defaults
```

## Docker

Build from the **monorepo root**:

```bash
docker build -f apps/backend/Dockerfile .
```

Ensure production env injects all validated variables (including `KEYCLOAK_*` and **`DATABASE_URL`**). The container entrypoint applies Prisma migrations first; if the database is down or migrations fail, the API process will not start.

## License

UNLICENSED (private monorepo).
