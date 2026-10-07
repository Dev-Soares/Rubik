# Lições — bugs reais e a regra que os previne

Memória do harness. Cataloga bug que **já aconteceu** neste projeto, a causa
raiz, a regra que o impede de voltar e o comando que comprova o conserto.

Não é changelog nem lista de tarefa. Entrada só nasce de bug real, encontrado
trabalhando — nunca de bug hipotético.

## Por que existe

Rule diz como escrever. ADR diz o que escolhemos. Nenhum dos dois captura
"isto já quebrou uma vez, do jeito exato que parecia certo". É o que mais se
repete quando ninguém anota.

## Protocolo

**Ao começar tarefa:** leia as entradas da área que você vai tocar. São curtas.

**Ao resolver bug não catalogado:** adicione entrada no fim, numerada em
sequência (`L1`, `L2`, …). No mesmo commit do fix.

**Entrada boa tem quatro partes, nesta ordem:**

| Parte | O que é |
|---|---|
| **Erro real** | O que aconteceu, com arquivo e valor concretos. Sem generalizar. |
| **Causa raiz** | Por que aconteceu — não o sintoma. Se a resposta é "esqueci", a causa é o que tornou possível esquecer. |
| **Regra** | O que fazer daqui pra frente. Precisa ser verificável, não conselho. |
| **Verificação** | Comando ou checagem que prova o conserto e detecta a volta. |

**Se a regra couber numa linha e valer sempre**, promova para
`.claude/rules/<escopo>/<assunto>.md` e deixe aqui só a referência. Este arquivo
é memória de incidente; a rule é a norma.

## Formato

```markdown
## L<n>. <Regra em uma frase, no imperativo>

**Erro real:** o que quebrou, onde, com que valor.

- **Causa raiz:** por que foi possível.
- **Regra:** o que fazer daqui pra frente.
- **Verificação:** `comando` / o que conferir.
```

---

## Entradas

## L1. Variante de atributo no Tailwind leva o valor: `data-[active=true]:`, nunca `data-active:`

**Erro real:** o hover da sidebar não pintava. Trocar a cor não resolvia, em
sessão nenhuma — e não era a cor: `NAV_ITEM_CLASS` tinha
`data-active:bg-transparent!`, que zerava o fundo de **todo** item da sidebar,
permanentemente. Qualquer `bg-*` aplicado depois perdia a disputa; um
`bg-red-500` adicionado no DOM para teste também não pintava. O
`ui/sidebar.tsx` do shadcn tinha o mesmo defeito em `data-active:bg-sidebar-accent`.

- **Causa raiz:** `data-active:` compila para `[data-active]`, que casa com a
  **presença** do atributo, não com o valor. O `SidebarMenuButton` recebe
  `data-active={isActive}` e o React serializa o booleano, então todo item
  carrega `data-active="false"` — e o seletor casava com todos. Com `!important`
  junto, virou uma regra invisível que vencia tudo.
- **Regra:** antes de usar `data-foo:`, confira **como o atributo é renderizado
  no estado falso**. Some do DOM (o padrão do Radix, que usa
  `data-state="checked"` ou nada) → `data-foo:` está correto. Vira a string
  `"false"` (`data-foo={bool}` em JSX) → use `data-[foo=true]:`, porque a
  variante curta casaria sempre. O erro não é a sintaxe curta; é usá-la com um
  atributo que persiste.
- **Verificação:** para cada `data-x:` novo, inspecione o elemento renderizado e
  confirme que o atributo não existe quando o estado é falso. Para o sintoma:
  medir o pixel do item sob hover, não o CSS — a regra existia, tinha
  `!important`, e mesmo assim não pintava. Ler o fonte não revela isso.

## L2. Componente recém-gerado pelo `pnpm ui:add` passa por revisão antes de ser usado

**Erro real:** `pnpm ui:add tabs` trouxe `ui/tabs.tsx` com três defeitos de uma
vez: `import { cn } from "cn"` — pacote que este repo removeu em favor de
`clsx` + `tailwind-merge` —, a dependência `cn` de volta no `package.json`, e
quatro classes `data-active:*` para estilizar a aba selecionada. O Radix emite
`data-state="active" | "inactive"`, nunca `data-active`, então o seletor não
casava com nada e a aba ativa ficaria sem estilo.

- **Causa raiz:** o gerador escreve o componente do registry público, que não
  conhece as convenções locais: ele assume o alias `cn` do shadcn padrão e usa
  as variantes do Tailwind na versão em que o registry foi publicado. Nada disso
  aparece em erro de build — o import quebra o typecheck (ruidoso, fácil), mas a
  variante morta é silenciosa.
- **Regra:** depois de todo `pnpm ui:add`, confira três coisas no arquivo
  gerado, antes de escrever a tela que o consome: (1) o import do `cn` aponta
  para `@/shared/lib/utils`; (2) `git diff package.json` não ganhou dependência
  nova indesejada; (3) cada `data-*:` usado existe como `@custom-variant` no
  `global.css` **e** casa com o atributo que o Radix realmente emite naquele
  primitivo. Variante nova → declare no `global.css` (é o caso de
  `data-active`).
- **Verificação:** `grep -rn "from 'cn'\|from \"cn\"" client/src` sai vazio;
  `git diff client/package.json` limpo; e para a variante, inspecionar o
  elemento e confirmar o atributo (`data-state="active"` na aba selecionada).

## L3. Casca que precisa sobreviver à navegação mora na rota, não na página

**Erro real:** a sidebar recolhida reabria sozinha a cada navegação, o grupo de
menu expandido fechava na mão do usuário e o `refetchInterval` de 30s do sino
reiniciava antes de completar — o contador de não lidas podia ficar velho
indefinidamente. As dez páginas autenticadas renderizavam o próprio
`<AppLayout>`, e `routes/_auth.tsx` era um `Outlet` pelado.

- **Causa raiz:** React só preserva estado quando o componente na mesma posição
  é do **mesmo tipo**. Com a casca dentro da página, ir de `Home` para
  `AdminUsers` troca o tipo naquela posição, e o React desmonta a subárvore
  inteira — `SidebarProvider` junto, cujo `open` é `useState`. Nenhum teste
  pegaria: a montagem é correta, o que quebra é a identidade entre duas
  montagens.
- **Regra:** estado que precisa sobreviver à troca de rota mora **acima** do
  ponto de troca — no `component` da rota de layout, com `<Outlet />` dentro.
  Antes de montar provider, assinatura ou timer, pergunte em que posição da
  árvore ele fica e se o tipo naquela posição é constante entre rotas. Ler o
  arquivo do componente não revela isso; é preciso olhar quem o monta.
- **Verificação:** recolher a sidebar, navegar entre duas abas e conferir que
  continua recolhida. No bundle, a casca aparece em **um** chunk compartilhado
  (`grep -l SidebarProvider dist/assets/*.js` devolve um arquivo só), não
  duplicada por página.

## L4. Rota que recebe `:id` de pessoa compara com o autor da requisição

**Erro real:** duas escaladas de privilégio, as duas alcançáveis por usuário
comum com `usuarios:editar`. (1) `PUT /roles/users/:userId/permissions` não
comparava `:userId` com quem chamava: apontando para o próprio id, o usuário
gravava `allowed: true` em toda permissão do sistema, e a exceção pessoal vence
o cargo por design. (2) `assertCanSetRole` validava que o cargo **existe**, não
**qual** cargo é — e `admin` é uma linha da tabela `role`, então `PATCH
/users/:id` com `{"role":"admin"}` promovia um terceiro a administrador.

- **Causa raiz:** o bug é a **ausência** de uma comparação, não código errado.
  Toda linha presente estava correta, e revisão por leitura não acusa o que não
  está escrito. A invariante existia no vizinho (`assertCanSetRole` recusa
  trocar o próprio cargo) e não foi replicada no caminho mais poderoso — e a
  mensagem de commit do fix anterior chegou a citar essa função como referência
  de blindagem, sem notar que ela não cobria o caso do terceiro.
- **Regra:** em toda rota que recebe id de pessoa (`:id`, `:userId`) e muda
  acesso, responda três perguntas antes de considerar pronto: **(a)** o alvo
  pode ser o próprio autor? **(b)** o autor pode conceder algo que ele mesmo não
  tem? **(c)** o alvo pode ser mais privilegiado que o autor? Cada "sim" sem
  guard é escalada. Permissão de tela (`usuarios:editar`) nunca autoriza mexer
  em cargo de sistema nem em administrador — isso é da role `admin`.
- **Verificação:** para cada rota de mudança de acesso, procure a comparação com
  o autor (`=== editor.id`) e a checagem de privilégio do alvo. Ausência das
  duas é o bug; `grep -n "editor" <service>` mostra se o autor sequer chega ao
  service.

## L5. Listagem paginada ordena por `createdAt, id` — sempre, com desempate

**Erro real:** `/roles` e `/users` paginavam sem `orderBy` nenhum, e
`/audit` ordenava por `createdAt` sem desempate. Com `LIMIT/OFFSET` isso faz um
registro repetir numa página e outro nunca aparecer — e a tela de cargos lia
essa listagem para montar o seletor do formulário de usuário, onde um cargo
podia simplesmente não estar.

- **Causa raiz:** Postgres não garante ordem sem `ORDER BY`; a ordem observada é
  a física, que muda a cada `UPDATE`. E `user` recebe `UPDATE` em todo PATCH e
  em todo login (via `updatedAt`), então a instabilidade não é teórica. Faltava
  também o desempate: `createdAt` sozinho empata, e em `audit_log` — uma linha
  por mutação — empata muito.
- **Regra:** toda listagem paginada ordena por `createdAt` **e** `id`, nessa
  ordem, decrescente. Não é preferência de apresentação: é o que torna a
  paginação correta, e é o que o keyset exigiria se o offset virar gargalo.
- **Verificação:** `grep -n "orderBy" server/src/modules/*/*.service.ts` — toda
  listagem com `.limit(` tem a linha, com dois argumentos.

## L6. Skeleton espelha a forma do conteúdo; o fallback não pode trocar a altura

**Erro real:** `UsersTableSkeleton` eram cinco barras `h-12` chapadas, contra uma
tabela com cabeçalho de 48px, `py-4` e avatar `size-9`.
`RolesGridSkeleton` usava um `h-44` fixo contra um card cuja altura vem do
conteúdo. Nos dois a página saltava ao resolver, na tela de administração mais
usada.

- **Causa raiz:** a regra escrita era só "skeleton em estado de carregamento
  visível" (`AGENTS.md` §2). Ela cobra a existência do skeleton e não diz nada
  sobre fidelidade, então um retângulo satisfazia a letra da regra e falhava no
  propósito — que é justamente o conteúdo não saltar.
- **Regra:** `.claude/rules/client/carregamento.md`, criada por causa deste bug.
  Skeleton copia moldura, cabeçalho, altura de linha e os breakpoints que
  escondem coluna. Card de altura variável monta-se das peças do card real,
  nunca de um `h-*` chutado.
- **Verificação:** alternar entre o skeleton e o conteúdo real na mesma tela e
  conferir que nada abaixo se move. `TicketListSkeleton` é o modelo correto.

<!--
Não preencha com bug hipotético nem com regra que já está em `.claude/rules/**`
— entrada sem incidente real vira ruído e faz o próximo leitor parar de ler o
arquivo.

Modelo do que uma entrada boa parece (exemplo de outro projeto, não deste):

## L1. Constante de negócio tem fonte única na camada mais baixa

**Erro real:** formulário de tarefa nascia com 30 minutos, mas a API salvava 60
— o form declarava `DEFAULT_MINUTES = 30` e o schema de validação tinha
`.default(60)`.

- **Causa raiz:** o mesmo default declarado em duas camadas. Ninguém errou ao
  escrever; erraram ao duplicar, e as cópias divergiram no primeiro ajuste.
- **Regra:** default, limite e vocabulário moram na camada mais baixa que os
  usa; as de cima importam o símbolo, nunca re-declaram o literal.
- **Verificação:** teste amarrando a igualdade, para o drift voltar como falha.
-->
