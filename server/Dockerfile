# Build a partir da RAIZ do repositório (workspace pnpm):
#   docker build -f server/Dockerfile -t app-server .

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app


FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY server/package.json ./server/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
	pnpm install --filter server... --frozen-lockfile


FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY server/package.json ./server/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY server ./server
RUN pnpm --filter server build
# Remove devDependencies do node_modules que será copiado para runtime
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
	pnpm install --filter server --prod --frozen-lockfile


FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/server/node_modules ./server/node_modules
COPY --from=build --chown=app:app /app/server/dist ./server/dist
COPY --from=build --chown=app:app /app/server/package.json ./server/

USER app
EXPOSE 3000

CMD ["node", "server/dist/main.js"]
