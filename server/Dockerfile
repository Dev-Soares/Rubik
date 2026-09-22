# Build a partir da RAIZ do repositório (workspace pnpm):
#   docker build -f server/Dockerfile -t app-server .
#
# Sem `--mount=type=cache` no pnpm install: o Railway RECUSA o build com
# "flag '--mount=type=cache,...' is missing the cacheKey prefix from its id".
# Ele exige ids no formato `s/<service id>-<path>`, o que prenderia este arquivo
# a um serviço de um projeto específico e quebraria `docker build` em qualquer
# outro lugar. O cache fica no Dockerfile.dev, que só roda no compose.
#
# A velocidade aqui vem do CACHE DE CAMADAS, não de cache mount: os manifests
# num stage próprio e os dois installs em stages paralelos.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# Os manifests mudam muito menos que o código: isolá-los numa camada própria
# faz o Docker reaproveitar os dois stages de install abaixo enquanto só houver
# mudança em `server/src` — que é o caso comum de um deploy.
FROM base AS manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY server/package.json ./server/


# Dependências COM as de desenvolvimento — é o que o `tsc` precisa para compilar.
FROM manifests AS deps
RUN pnpm install --filter server... --frozen-lockfile


# Só as de produção, para o runtime. Stage PRÓPRIO e não um segundo install
# dentro do `build`: sem a dependência serial, o BuildKit resolve este em
# paralelo com o `deps`, e o tempo dos dois passa a ser o do mais lento em vez
# da soma.
FROM manifests AS prod-deps
RUN pnpm install --filter server --prod --frozen-lockfile


FROM manifests AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY server ./server
RUN pnpm --filter server build


FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=prod-deps --chown=app:app /app/node_modules ./node_modules
COPY --from=prod-deps --chown=app:app /app/server/node_modules ./server/node_modules
COPY --from=build --chown=app:app /app/server/dist ./server/dist
COPY --from=build --chown=app:app /app/server/package.json ./server/

USER app
EXPOSE 3000

# Migrations antes do boot: um deploy com schema novo não pode subir um server
# que quebra na primeira query. `migrate` sai != 0 se falhar, e o `&&` impede
# a API de subir sobre um banco desatualizado.
#
# O seed vem entre os dois e cria o admin inicial quando a base ainda está
# vazia — sem ele, um deploy novo sobe sem nenhuma forma de entrar, já que o
# cadastro público é desativado. Em produção ele se ignora assim que existe
# qualquer usuário, então repetir o deploy não recria nada.
#
# `||true` de propósito, ao contrário do migrate: o seed sai != 0 quando
# chamado na mão e falha (é o que `pnpm db:seed` precisa reportar), mas no boot
# isso derrubaria a aplicação inteira. Schema desatualizado quebra a API na
# primeira query e justifica abortar; admin não criado, não — a aplicação sobe
# e o erro fica no log do deploy.
CMD ["sh", "-c", "node server/dist/db/migrate.js && { node server/dist/db/seed.js || true; } && node server/dist/main.js"]
