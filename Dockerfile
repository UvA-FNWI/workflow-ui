FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS prod

ARG npm_token
ENV NPM_TOKEN=$npm_token

WORKDIR /app

COPY pnpm-lock.yaml package.json ./

RUN pnpm fetch

RUN pnpm install --prod --frozen-lockfile

COPY . .

RUN pnpm run build

FROM nginx:1.29.0-alpine
RUN apk add --no-cache bash

RUN mkdir -p /etc/nginx/templates
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=prod /app/dist /usr/share/nginx/html
