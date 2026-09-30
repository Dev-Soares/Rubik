# Observabilidade

Log existe para responder **"o que aconteceu com este usuário, nesta
requisição"** depois que já aconteceu. Log que não ajuda nisso é ruído, e ruído
faz o alerta de verdade ser ignorado.

## Correlação — `requestId`

Todo request tem um id que atravessa o sistema inteiro:

1. O client gera e manda em `x-request-id` (`client/src/api/axios.ts`).
2. O servidor reaproveita — ou gera, se não veio — em `genReqId`
   (`server/src/config/logger.config.ts`) e devolve no mesmo header.
3. Todo log do request sai com ele, junto de `userId` (`customProps`).
4. Erro tratado devolve `requestId` no corpo
   (`server/src/common/filters/all-exceptions.filter.ts`), e a tela de erro o
   exibe em produção (`client/src/pages/ErrorPage.tsx`).

O usuário informa o código no chamado → `grep` do id acha o stack. Sem isso a
investigação começa cruzando horário aproximado com tabela de sessão.

**Não invente um segundo mecanismo de correlação.** Se precisar do id em um
service, leia `request.id`.

## Nível

| Nível | Quando |
|---|---|
| `error` | 5xx, exceção não tratada, requisição acima de 5s, job que falhou. **Dispara alerta** — se não merece acordar alguém, não é `error`. |
| `warn` | 4xx, requisição acima de 1s, degradação com fallback (integração fora do ar, storage desligado). |
| `info` | Boot, shutdown, ciclo de request (automático via `autoLogging`), evento de negócio relevante e raro. |
| `debug` | Só sob investigação. Nunca ligado por padrão em produção. |

4xx em `warn` é decisão: é erro de quem chamou, não incidente. Alerta de
produção deve disparar em `error` e só.

## Como logar

```typescript
// BOM — objeto estruturado, mensagem curta e constante
this.logger.warn({ requestId, userId, ticketId, durationMs }, 'chamado sem resposta do webhook');

// RUIM — interpolação: não dá para filtrar, agrupar nem alertar
this.logger.warn(`chamado ${ticketId} do usuário ${userId} sem resposta`);
```

Mensagem é **constante**; o que varia vai no objeto. É o que permite agrupar
ocorrências no coletor.

## O que nunca vai para o log

Senha, token, cookie, header `authorization`, `x-api-key`, segredo de S3.
`REDACTED_PATHS` em `logger.config.ts` corta o que se conhece — a lista é rede,
não licença para logar objeto cru. Logou DTO inteiro, conferiu se tem credencial
dentro.

Dado pessoal além do `userId` também não: o id resolve a investigação, nome e
e-mail no log só aumentam a superfície de vazamento.

## Regras que valem sempre

- **Não logue e re-lance o mesmo erro.** Decida em um lugar só; o filter global
  já loga toda exceção que sobe. `catch` que loga e re-lança gera a mesma linha
  duas vezes.
- **`catch` vazio é bug latente.** Se o erro é ignorável, `logWarn` dizendo por
  quê.
- **Sem log de sucesso de caminho quente.** `autoLogging` já registra o ciclo do
  request; `logger.info('entrou no service')` é ruído.

## Client

Saída única em `client/src/shared/utils/logger.ts`. Componente não chama
`console` direto — em produção o console do usuário não é lido por ninguém, e a
função `report` é onde um projeto derivado pluga Sentry/Datadog sem tocar em
mais nada.

O interceptor de resposta do axios já loga toda falha de API com `requestId`.
Não duplique esse log no hook ou no componente.

`AppErrorBoundary` (`client/src/shared/components/`) pega o que estoura fora do
ciclo de rota e reporta com o stack de componentes. É a última rede — não
substitui tratar erro esperado no lugar dele.
