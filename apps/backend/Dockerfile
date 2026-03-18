# Build context must be the monorepo root:
#   docker build -f apps/backend/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable

# Stage 1: Prune — turbo prune generates a minimal copy of the monorepo
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @scoreboard/backend --docker

# Stage 2: Install — install only the pruned subset's dependencies
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Stage 3: Build — compile the backend (and @scoreboard/core upstream)
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@scoreboard/backend

# Stage 4: Run — minimal runtime image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

EXPOSE 3000

CMD ["node", "dist/main"]
