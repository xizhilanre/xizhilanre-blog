# ─── Stage 1: Build ────────────────────────────────────────
FROM node:18-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy root workspace files for install
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./

# Copy workspace dependency (types) — package.json + source
COPY packages/types/package.json ./packages/types/package.json
COPY packages/types/tsconfig.json ./packages/types/tsconfig.json
COPY packages/types/src ./packages/types/src

# Copy API package configs
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/api/tsconfig.build.json ./apps/api/tsconfig.build.json
COPY apps/api/nest-cli.json ./apps/api/nest-cli.json

RUN pnpm install --frozen-lockfile

# Copy API source and build
COPY apps/api/src ./apps/api/src

# Build: turbo pipeline ensures ^build (types) runs before api
RUN pnpm turbo build --filter=@xizhilanre/api

# Deploy: copies package + dist + production deps only
RUN pnpm --filter @xizhilanre/api deploy --prod /deploy

# ─── Stage 2: Production ────────────────────────────────────
FROM node:18-alpine

ENV NODE_ENV=production

COPY --from=builder /deploy /app

WORKDIR /app

EXPOSE 3001

CMD ["node", "dist/main.js"]
