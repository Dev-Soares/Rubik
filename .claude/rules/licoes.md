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

<!--
Vazio de propósito. Este projeto ainda não acumulou incidente registrado.

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
