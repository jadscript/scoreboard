# Build context must be the monorepo root:
#   docker build -f apps/backend/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable

# ── Stage 1: Prune ──────────────────────────────────────────────────────────
# Produces a minimal copy of the monorepo with only what @scoreboard/backend
# and its workspace dependencies need.
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @scoreboard/backend --docker

# ── Stage 2: Install ─────────────────────────────────────────────────────────
# Copy only the pruned package.json files + lockfile first so that Docker can
# cache this layer and skip re-installing when only source files change.
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# ── Stage 3: Build ───────────────────────────────────────────────────────────
# Copy source, compile, then use `pnpm deploy` to produce a self-contained
# directory with production deps resolved without pnpm symlinks — the only
# portable form that works when copied into a bare Node image.
FROM installer AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@scoreboard/backend
RUN pnpm --filter=@scoreboard/backend deploy --prod /deploy

# ── Stage 4: Run ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# node_modules from pnpm deploy (no symlinks — fully self-contained)
COPY --from=builder /deploy/node_modules ./node_modules
# compiled output from nest build
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
