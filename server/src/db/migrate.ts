/**
 * Aplica as migrations pendentes e sai.
 *
 * Roda antes da API subir (ver `CMD` do `server/Dockerfile`), para que um deploy
 * com schema novo não suba um server que quebra na primeira query.
 *
 * Usa o migrator do `drizzle-orm` em vez do `drizzle-kit`: o kit é
 * devDependency e não existe na imagem de produção, que instala só `--prod`.
 * A pasta de migrations é copiada junto no estágio de runtime.
 */
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from 'src/config/env';

async function main() {
	// Conexão própria, separada da do app: `max: 1` porque o migrator roda um
	// comando por vez e segura um lock — um pool aqui não acelera nada.
	const client = postgres(env.DATABASE_URL, { max: 1 });

	try {
		await migrate(drizzle(client), {
			migrationsFolder: 'server/dist/db/migrations',
			migrationsTable: 'migrations',
			migrationsSchema: 'drizzle',
		});
	} finally {
		await client.end();
	}
}

main().catch((error: unknown) => {
	// eslint-disable-next-line no-console -- o logger do Nest ainda não existe: isto roda antes do boot
	console.error('[migrate] falhou:', error instanceof Error ? error.message : error);
	process.exit(1);
});
