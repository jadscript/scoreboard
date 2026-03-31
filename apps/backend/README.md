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

Ensure production env injects all validated variables (including `KEYCLOAK_*`).

## License

UNLICENSED (private monorepo).
