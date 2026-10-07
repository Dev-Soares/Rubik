-- Índice na FK de `session` e `account`.
--
-- As duas apontam para `user` com `ON DELETE cascade`, e sem índice o Postgres
-- varre a tabela filha inteira a cada remoção no pai. É também o caminho que o
-- Better Auth usa para revogar as sessões de uma pessoa (inativar conta
-- encerra todas) e para achar a credencial ao validar login ou trocar senha.
--
-- `session.token` já tinha índice pelo `UNIQUE` — a leitura de sessão, que é o
-- caminho quente, já estava coberta. O que faltava era a busca por usuário.
--
-- `IF NOT EXISTS` porque a base de quem já rodou `db:push` em dev pode ter os
-- índices criados fora do versionamento.

CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" USING btree ("user_id");
