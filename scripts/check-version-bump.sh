#!/usr/bin/env bash
# Reprova mudança que chega a produção sem bump de versão.
#
# Cobra uma coisa só, mecânica: se o diff toca algo fora dos caminhos que não
# rodam em produção, `client/package.json` tem de mudar de versão.
#
# Exceção explícita: `Nível: chore` no corpo da PR (ou na mensagem do commit)
# dispensa o bump. Ver `.claude/rules/versionamento.md`.
#
# Uso: bash scripts/check-version-bump.sh <base> <head>
set -uo pipefail

BASE="${1:-origin/main}"
HEAD_REF="${2:-HEAD}"
VERSION_FILE="client/package.json"

# Caminhos que não chegam a produção.
IGNORADOS=(':(exclude).claude/**' ':(exclude).github/**' ':(exclude)scripts/**' ':(exclude)*.md')

mudou_producao=$(git diff --name-only "$BASE" "$HEAD_REF" -- . "${IGNORADOS[@]}")

if [ -z "$mudou_producao" ]; then
  echo "✓ nada que rode em produção mudou — bump dispensado"
  exit 0
fi

versao_base=$(git show "$BASE:$VERSION_FILE" 2>/dev/null | grep -m1 '"version"' | cut -d'"' -f4)
versao_head=$(git show "$HEAD_REF:$VERSION_FILE" 2>/dev/null | grep -m1 '"version"' | cut -d'"' -f4)

if [ -n "$versao_base" ] && [ "$versao_base" != "$versao_head" ]; then
  echo "✓ versão bumpada: $versao_base → $versao_head"
  exit 0
fi

# `Nível: chore` declarado é decisão registrada, não esquecimento.
#
# O corpo vem do PR quando o CI roda, e das mensagens de commit no pre-push.
# A regex ignora o acento de propósito: `grep` depende de locale para casar
# `í`, e em runner com LC_ALL=C o portão passaria a rejeitar a exceção sem
# ninguém entender por quê.
corpo="${PR_BODY:-}"
if [ -z "$corpo" ]; then
  corpo=$(git log --format=%B "$BASE..$HEAD_REF" 2>/dev/null)
fi

if printf '%s' "$corpo" | grep -qiE 'n.{0,2}vel:[[:space:]]*chore'; then
  echo "✓ 'Nível: chore' declarado — bump dispensado"
  exit 0
fi

cat <<MSG
🔴 mudança em produção sem bump de versão.

   Arquivos fora dos caminhos ignorados mudaram, mas $VERSION_FILE
   continua em $versao_head.

   Bumpe $VERSION_FILE pelo nível da mudança
   (.claude/rules/versionamento.md), ou declare 'Nível: chore' no corpo da PR.

   Mudou:
$(printf '%s\n' "$mudou_producao" | sed 's/^/     /' | head -20)
MSG
exit 1
