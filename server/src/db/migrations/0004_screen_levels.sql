-- Migração de dados: a permissão de tela ganhou nível (`<tela>:<nível>`).
-- O valor antigo, sem nível, vira leitura. Escrita é concedida depois, à mão.
-- Não há DDL aqui: as duas colunas já eram texto.

UPDATE "role"
SET "screens" = (
	SELECT string_agg(
		CASE WHEN position(':' in trim(part)) > 0 THEN trim(part) ELSE trim(part) || ':read' END,
		','
	)
	FROM unnest(string_to_array("screens", ',')) AS part
	WHERE trim(part) <> ''
)
WHERE "screens" IS NOT NULL AND "screens" <> '';
--> statement-breakpoint
UPDATE "user_screen_override"
SET "screen" = "screen" || ':read'
WHERE position(':' in "screen") = 0;
