# Versionamento

A versão exibida no rodapé da sidebar sai de `client/package.json` e é congelada
**no build** (`define` do Vite → `__APP_VERSION__`, lido por
`client/src/shared/version.ts`). O que a tela mostra é o que foi compilado — não
há valor de runtime que possa divergir do bundle servido.

⚠️ O arquivo a editar é `client/package.json`, **não** o `package.json` da raiz.
Só o primeiro casa com o `watchPatterns` de `client/railway.json`: um bump feito
na raiz fica no repositório sem chegar à tela.

## Toda PR declara o nível do ajuste

O bump sai do **nível da mudança**, não do tamanho do diff nem da quantidade de
arquivos.

| Nível | Bump | Quando |
|---|---|---|
| `breaking` | **major** (`1.1.0` → `2.0.0`) | Contrato quebrado: rota removida/renomeada, formato de resposta alterado, migration destrutiva, env obrigatória nova. Quem já usava para de funcionar. |
| `feature` | **minor** (`1.1.0` → `1.2.0`) | Funcionalidade nova, ou campo/tela/ação que antes não existia. Nada quebra para quem já usava. |
| `fix` | **patch** (`1.1.0` → `1.1.1`) | Correção de comportamento, ajuste visual, refactor, teste, performance. |
| `chore` | **nenhum** | Só documentação, CI, script de dev, dependência de desenvolvimento. Não muda o que roda em produção. |

**PR com mais de um nível bumpa pelo MAIOR.** Uma PR que corrige dois bugs e
adiciona um campo é `feature` — o menor nunca dilui o maior.

Pela tabela, PR só de teste é `fix` e portanto exige patch. Se isso não for
desejado em um projeto derivado, o que muda é a tabela — não o portão.

## O bump vai NA PRÓPRIA PR

No mesmo commit da mudança que o justifica, nunca num passo separado depois.
Bumpar em PR própria abre duas janelas de erro:

- A versão mente entre o merge e o bump: produção com código novo anunciando o
  número velho, e ninguém sabe qual bundle está no ar.
- O bump vira um deploy inteiro do client só para trocar um número, em vez de
  viajar de graça com a mudança que ele descreve.

## Corpo da PR

A decisão fica auditável no histórico, não só na cabeça de quem abriu:

```
Nível: feature → 1.1.0 → 1.2.0
```

## O portão que cobra isto

O job `versão` do CI reprova PR que altera o que roda em produção sem mudar
`client/package.json`. Ele cobra **uma coisa só**, mecânica — portão barulhento
é portão que alguém desliga, e a metade com consequência em produção é o bump.

Ficam de fora do portão (não chegam a produção): `.claude/**`, `.github/**`,
`scripts/**` e `*.md`.

**A exceção é explícita**: declarar `Nível: chore` no corpo da PR dispensa o
bump. Quem declara `chore` tendo mexido em produção não esqueceu — decidiu, e a
decisão fica escrita onde a revisão a lê.

## Tag e histórico

Release que vai para produção ganha tag `v<versão>` no merge para `main`
(`git tag v1.2.0 && git push --tags`). A tag é o que permite `git diff
v1.1.0..v1.2.0` quando alguém pergunta o que entrou — não existe changelog
mantido à mão, porque changelog à mão desatualiza e o histórico de commit não.
