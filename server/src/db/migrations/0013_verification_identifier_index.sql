-- Índice em `verification.identifier`.
--
-- É por onde o Better Auth busca o token nos fluxos de verificação de e-mail e
-- redefinição de senha. A tabela fica vazia enquanto não houver e-mail
-- configurado, então aqui o índice não muda nada — existe para que o projeto
-- derivado que ligar esses fluxos não herde um seq scan no caminho de login.
--
-- `IF NOT EXISTS` porque a base de quem já rodou `db:push` em dev pode ter o
-- índice criado fora do versionamento.

CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");
