# Engenharia mínima — YAGNI · KISS · DRY

Vale em todo escopo. O objetivo não é "escrever pouco": é não construir o que
ninguém pediu e não inventar o que já existe.

## Escada YAGNI

Antes de escrever qualquer código, pare no **primeiro degrau que resolve**:

1. **Precisa existir mesmo?** Não → não construa.
2. **Já existe no repo?** *Prove* — grepe, abra o arquivo, cite o caminho.
   Reuso comprovado > reuso presumido.
3. **A plataforma resolve?** `<input type="date">`, `Intl.DateTimeFormat`,
   `URLSearchParams`, `structuredClone`, `Array.prototype.*`.
4. **Uma dependência já instalada resolve?** Zod, react-hook-form, TanStack
   Query, Drizzle, `clsx`/`cn`, shadcn (`pnpm ui:add`).
5. **Cabe em uma linha?** Uma linha.
6. Só então: **o mínimo que funciona.**

A escada roda **depois** de entender o problema, nunca no lugar dele. Leia a
task inteira, leia o código que ela toca, trace o fluxo de ponta a ponta — só
então escolha o degrau. Preguiçoso na solução, nunca na leitura: mudança pequena
no lugar errado não é minimalismo, é um segundo bug.

**Dependência nova é último recurso.** Justifique no PR: o que ela resolve que
os degraus 3-4 não resolvem.

## KISS — o que "simples" significa aqui

Simples é **legível na primeira leitura**, não "esperto" nem "curto".

- Early return em vez de `if` aninhado.
- Nome descritivo em vez de comentário explicando nome ruim.
- Condição complexa vira variável nomeada: `const podeEditar = ...`.
- Ternário aninhado não existe. Use `if`/early return ou um `Record` de lookup.
- Sem factory, sem builder, sem camada de indireção que ninguém pediu.
- Sem generic que serve a um consumidor só.
- Sem flag booleana de parâmetro que muda o comportamento da função —
  são duas funções.

```typescript
// RUIM — esperto, ilegível
const s = u.r === 'admin' ? 'A' : u.r === 'editor' ? (u.a ? 'E' : 'P') : 'V';

// BOM — chato, óbvio
if (user.role === 'admin') return 'Administrador';
if (user.role !== 'editor') return 'Visualizador';
return user.active ? 'Editor' : 'Pendente';
```

## DRY — e quando não aplicar

Duplicata de **regra** é bug latente: as duas cópias divergem, e a que ninguém
lembrou vira o bug. A mesma transformação em dois lugares → extraia para
`utils/` e troque os dois.

**Mas DRY é sobre conhecimento, não sobre caracteres iguais.** Dois trechos
parecidos que mudam por motivos diferentes devem permanecer separados —
acoplá-los cria a abstração que depois recebe um parâmetro `tipo` para voltar a
se dividir.

Regra prática: **duas ocorrências, deixe.** Na terceira, ou quando as duas
mudarem juntas pelo mesmo motivo, extraia. Extrair na primeira repetição é
adivinhação.

```
// EXTRAIA — mesma regra, muda junto
cálculo de permissão efetiva em RolesGuard e em roles.service
  -> common/utils/roles.utils.ts

// DEIXE — parecidos hoje, motivos diferentes
validação do form de perfil e do form de criação de usuário
  (uma segue o que o usuário pode editar; a outra, o que o admin pode definir)
```

Antes de extrair, aplique o degrau 2: pode já estar em
`shared/utils/`, `shared/hooks/`, `common/utils/` ou `common/types/`.

## Teto conhecido — marque

Simplificação deliberada que tem limite conhecido leva comentário nomeando **o
teto e o caminho de upgrade**. Vira sinal visual em vez de armadilha:

```typescript
// yagni: busca client-side basta até ~500 registros; virar filtro no backend se passar disso
// yagni: contador em memória, some no restart; mover para tabela se precisar sobreviver a deploy
```

Sem o comentário, o próximo leitor não distingue simplificação consciente de
descuido — e o custo de descobrir é um bug em produção.

## Nunca corte

Em nome de menos código, jamais:

- Validação de input externo na fronteira (DTO ou Zod) — ver `AGENTS.md` §1.
- Error handling que previne perda de dado (transação, rollback).
- Segurança: guard, `httpOnly`, segredo fora de log e de response.
- Acessibilidade: `label`, `aria-*`, alvo de toque.
- Skeleton em estado de carregamento visível.
- Qualquer coisa pedida explicitamente.
- Seção no guia quando a feature é visível ao usuário
  (`.claude/rules/client/guide.md`).

## Bugfix é causa raiz, não sintoma

O ticket reporta onde **apareceu**. Antes de corrigir, grepe todos os
consumidores da função tocada: um guard na função compartilhada rende diff menor
que um por chamador, e corrigir só o caminho do ticket deixa o chamador irmão
quebrado — o mesmo bug volta com outro número.

## Deletar conta como entregar

Código morto é custo de manutenção sem receita. Removeu o último consumidor de
um util, hook, type ou componente? Delete no mesmo commit. Antes de deletar um
`export`, grepe os consumidores no repo inteiro — inclusive `routeTree.gen.ts` e
`*.module.ts`.
