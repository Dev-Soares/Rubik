-- Devolutiva do chamado: o que o atendimento respondeu.
--
-- Aditiva e nula: todo chamado já resolvido antes desta coluna existir fica com
-- `NULL`, que é exatamente o que significa — foi resolvido sem resposta
-- escrita. Um backfill com texto genérico ("resolvido") inventaria uma
-- devolutiva que ninguém escreveu, e o usuário leria como se o atendimento
-- tivesse respondido isso.
--
-- Nada neste sistema a escreve: o texto chega de fora, junto da resolução, na
-- consulta que o deploy faz ao atendimento (`ticket-sync`).

ALTER TABLE "ticket" ADD COLUMN IF NOT EXISTS "resolution" text;
