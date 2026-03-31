# Build context must be the monorepo root:
#   docker build -f apps/frontend/Dockerfile \
#     --build-arg VITE_KEYCLOAK_URL=https://auth.example.com/ \
#     --build-arg VITE_KEYCLOAK_REALM=scoreboard \
#     --build-arg VITE_KEYCLOAK_CLIENT=client-web \
#     --build-arg VITE_API_URL=https://api.example.com .

FROM node:22-alpine AS base
RUN corepack enable

# ── Stage 1: Prune ──────────────────────────────────────────────────────────
# Produces a minimal copy of the monorepo with only what @scoreboard/frontend
# and its workspace dependencies need.
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @scoreboard/frontend --docker

# ── Stage 2: Install ─────────────────────────────────────────────────────────
# Copy only the pruned package.json files + lockfile first so that Docker can
# cache this layer and skip re-installing when only source files change.
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# ── Stage 3: Build ───────────────────────────────────────────────────────────
# Vite inlines VITE_* env vars at build time into the static JS bundle.
# Pass them via --build-arg when building the image.
FROM installer AS builder
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT
ARG VITE_API_URL
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@scoreboard/frontend

# ── Stage 4: Serve ───────────────────────────────────────────────────────────
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=pruner /app/apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
