FROM docker.io/node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS prod

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages ./packages

RUN pnpm fetch

RUN pnpm install --frozen-lockfile

RUN pnpm exec playwright install --with-deps

COPY . .

RUN pnpm run e2e-test