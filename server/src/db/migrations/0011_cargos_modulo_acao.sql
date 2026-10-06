-- Cargos por módulo × ação, no lugar de tela × nível.
--
-- RENAME, não DROP/CREATE: a tabela de exceções e a coluna de permissões
-- guardam o que o administrador configurou. Recriar as duas perderia isso e
-- devolveria todo usuário ao acesso do cargo, sem aviso.
--
-- O mapa das chaves antigas para as novas:
--   admin.users:read   -> usuarios:ver
--   admin.users:write  -> usuarios:criar, usuarios:editar, usuarios:apagar
--   admin.roles:read   -> cargos:ver
--   admin.roles:write  -> cargos:criar, cargos:editar, cargos:apagar
--   admin.audit:read   -> auditoria:ver
--   admin.audit:write  -> (não existe: auditoria é registro, só se lê)
--
-- O `write` antigo era um nível só e dava tudo dentro da tela, então vira as
-- três ações de escrita. É a leitura fiel do que o cargo já podia fazer.

ALTER TABLE "role" RENAME COLUMN "screens" TO "permissions";--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "color" text DEFAULT 'neutral' NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "icon" text DEFAULT 'pessoa' NOT NULL;--> statement-breakpoint

ALTER TABLE "user_screen_override" RENAME TO "user_permission_override";--> statement-breakpoint
ALTER TABLE "user_permission_override" RENAME COLUMN "screen" TO "permission";--> statement-breakpoint
ALTER INDEX "user_screen_override_user_id_idx" RENAME TO "user_permission_override_user_id_idx";--> statement-breakpoint
ALTER INDEX "user_screen_override_user_id_screen_pk" RENAME TO "user_permission_override_user_id_permission_pk";--> statement-breakpoint

-- Converte o CSV de cada cargo. `string_to_array` + `unnest` traduz item a
-- item, e o `string_agg` remonta a lista na ordem da declaração.
UPDATE "role" SET "permissions" = COALESCE((
  SELECT string_agg(DISTINCT nova, ',')
  FROM unnest(string_to_array("role"."permissions", ',')) AS antiga,
  LATERAL (
    SELECT unnest(CASE trim(antiga)
      WHEN 'admin.users:read'  THEN ARRAY['usuarios:ver']
      WHEN 'admin.users:write' THEN ARRAY['usuarios:ver','usuarios:criar','usuarios:editar','usuarios:apagar']
      WHEN 'admin.roles:read'  THEN ARRAY['cargos:ver']
      WHEN 'admin.roles:write' THEN ARRAY['cargos:ver','cargos:criar','cargos:editar','cargos:apagar']
      WHEN 'admin.audit:read'  THEN ARRAY['auditoria:ver']
      WHEN 'admin.audit:write' THEN ARRAY['auditoria:ver']
      ELSE ARRAY[]::text[]
    END) AS nova
  ) AS traduzida
), '') WHERE "permissions" <> '';--> statement-breakpoint

-- O crachá dos cargos de sistema, para não nascerem todos cinza.
UPDATE "role" SET "color" = 'primary', "icon" = 'escudo' WHERE "name" = 'admin';--> statement-breakpoint

-- As exceções: uma linha antiga de `write` vira as três de escrita, e a PK
-- composta recusaria duplicata, então o INSERT ignora conflito.
CREATE TEMP TABLE "override_convertido" AS
SELECT o."user_id", t.nova AS "permission", o."allowed", o."created_at", o."updated_at"
FROM "user_permission_override" o,
LATERAL (
  SELECT unnest(CASE o."permission"
    WHEN 'admin.users:read'  THEN ARRAY['usuarios:ver']
    WHEN 'admin.users:write' THEN ARRAY['usuarios:criar','usuarios:editar','usuarios:apagar']
    WHEN 'admin.roles:read'  THEN ARRAY['cargos:ver']
    WHEN 'admin.roles:write' THEN ARRAY['cargos:criar','cargos:editar','cargos:apagar']
    WHEN 'admin.audit:read'  THEN ARRAY['auditoria:ver']
    WHEN 'admin.audit:write' THEN ARRAY['auditoria:ver']
    ELSE ARRAY[]::text[]
  END) AS nova
) AS t;--> statement-breakpoint

DELETE FROM "user_permission_override";--> statement-breakpoint

INSERT INTO "user_permission_override" ("user_id", "permission", "allowed", "created_at", "updated_at")
SELECT DISTINCT ON ("user_id", "permission") "user_id", "permission", "allowed", "created_at", "updated_at"
FROM "override_convertido"
ON CONFLICT DO NOTHING;--> statement-breakpoint

DROP TABLE "override_convertido";
