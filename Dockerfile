FROM docker.io/node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS prod

ARG npm_token
ENV NPM_TOKEN=$npm_token

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages ./packages

RUN pnpm fetch

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build:ui && pnpm run build

FROM docker.io/nginx:1.29.3-alpine
RUN apk add --no-cache bash

RUN mkdir -p /etc/nginx/templates
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=prod /app/dist /usr/share/nginx/html
