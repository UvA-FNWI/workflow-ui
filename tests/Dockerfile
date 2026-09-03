FROM docker.io/node:24.20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global --allow-scripts=pnpm pnpm@12.2.1

FROM base AS prod

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY packages ./packages

RUN pnpm fetch

RUN pnpm install --frozen-lockfile

RUN pnpm exec playwright install --with-deps

COPY . .

RUN pnpm run build

RUN echo "window._env = { VITE_WEBAPI_URL: 'http://localhost:5025/', };" > ./public/environment.js

ENTRYPOINT ["pnpm", "run", "e2e-test"]
