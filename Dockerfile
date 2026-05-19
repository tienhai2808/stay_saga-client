ARG NODE_VERSION=24.12
ARG NODE_PREFIX_VERSION=24
ARG ALPINE_VERSION=3.23
ARG DEBIAN_VERSION=13

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

RUN corepack enable

WORKDIR /app

FROM base AS deps

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile

FROM base AS builder

ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN --mount=type=cache,target=/app/.next/cache \
  pnpm build

FROM gcr.io/distroless/nodejs${NODE_PREFIX_VERSION}-debian${DEBIAN_VERSION}:nonroot AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static

EXPOSE 3000

CMD ["server.js"]
