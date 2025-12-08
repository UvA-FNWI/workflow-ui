FROM docker.io/node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS build

WORKDIR /app

COPY package.json ./

RUN pnpm fetch

RUN pnpm install

COPY . .

RUN pnpm run storybook:build

FROM docker.io/nginx:1.29.3-alpine

RUN apk add bash

RUN mkdir /etc/nginx/templates

COPY --from=build /app/storybook-static /usr/share/nginx/html