# Build a partir da RAIZ do repositório (workspace pnpm):
#   docker build -f client/Dockerfile --build-arg VITE_API_URL=https://api.exemplo.com -t app-client .
#
# Sem `--mount=type=cache` no pnpm install: o Railway RECUSA o build com
# "flag '--mount=type=cache,...' is missing the cacheKey prefix from its id".
# Ele exige ids no formato `s/<service id>-<path>`, o que prenderia este arquivo
# a um serviço de um projeto específico e quebraria `docker build` em qualquer
# outro lugar. O cache fica no Dockerfile.dev, que só roda no compose.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app


FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY client/package.json ./client/
RUN pnpm install --filter client... --frozen-lockfile

# O código depois do install: enquanto os manifests não mudarem, a camada de
# dependências sai do cache mesmo com `client/src` alterado a cada commit.
COPY client ./client

# Vite injeta env no bundle em BUILD time, não em runtime.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter client build


FROM nginx:alpine AS runtime

# Em `templates/`, não em `conf.d/`: o entrypoint da imagem roda `envsubst`
# sobre os templates no boot e grava o resultado em `conf.d/`. É o que resolve
# a porta em runtime — Railway e Cloud Run injetam `PORT` e roteiam só para ela,
# então um `listen 80` fixo deixa o healthcheck batendo onde não há ninguém.
COPY client/nginx.conf.template /etc/nginx/templates/default.conf.template

# Restringe a substituição a `PORT`. Sem isto, `envsubst` trocaria também
# `$uri` e outras variáveis do nginx por string vazia, e `try_files` pararia de
# resolver as rotas do SPA.
ENV NGINX_ENVSUBST_FILTER=PORT

# Default para quem roda a imagem na mão (`docker run -p 8080:80`). Quem injeta
# `PORT` sobrescreve. Sem um valor aqui, `listen ${PORT};` viraria `listen ;` e
# o nginx nem subiria.
ENV PORT=80

COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
