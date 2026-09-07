FROM docker.io/node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS build

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages ./packages

RUN pnpm fetch
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @uva-fnwi/datanose-ui storybook:build

FROM docker.io/nginx:1.29.3-alpine

RUN apk add bash

RUN mkdir /etc/nginx/templates

COPY --from=build /app/packages/ui/storybook-static /usr/share/nginx/html
