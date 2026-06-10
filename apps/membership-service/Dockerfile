FROM node:22-alpine AS base
RUN corepack enable pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY packages/shared-config/package.json packages/shared-config/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/nest-common/package.json packages/nest-common/
COPY apps/membership-service/package.json apps/membership-service/
RUN pnpm install --frozen-lockfile --filter @nexushub/membership-service...

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY packages ./packages
COPY apps/membership-service ./apps/membership-service
RUN pnpm turbo build --filter=@nexushub/membership-service

# Production stage — minimal image
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder --chown=nestjs:nodejs /app ./
USER nestjs
EXPOSE 3004
CMD ["node", "apps/membership-service/dist/main.js"]
