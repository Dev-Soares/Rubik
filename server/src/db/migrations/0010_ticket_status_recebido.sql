ALTER TABLE "ticket" ALTER COLUMN "status" SET DEFAULT 'recebido';--> statement-breakpoint
-- Backfill: o diff de schema só troca o default, e linha existente ficaria com
-- 'aberto' — valor que nenhuma aba filtra e nenhum contador soma, fazendo o
-- chamado desaparecer da tela sem ter sido resolvido.
UPDATE "ticket" SET "status" = 'recebido' WHERE "status" = 'aberto';
