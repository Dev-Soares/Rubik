/**
 * Cria o usuário administrador inicial.
 *
 * Idempotente: se o e-mail já existir, apenas garante a role `admin` e sai.
 * Usa o endpoint HTTP do Better Auth para o cadastro, garantindo que o hash da
 * senha seja gerado exatamente como no fluxo real de sign-up.
 *
 * Uso: `pnpm db:seed` (com o servidor rodando).
 */
import { eq } from 'drizzle-orm';
import { db, queryClient } from 'src/db/db.provider';
import { user } from 'src/db/schema/auth';
import { env, isProduction } from 'src/config/env';

const SEED_NAME = process.env.SEED_ADMIN_NAME ?? 'Administrador';
const SEED_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@local.dev';
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';

function log(message: string): void {
	process.stdout.write(`[seed] ${message}\n`);
}

async function promoteToAdmin(id: string): Promise<void> {
	await db.update(user).set({ role: 'admin' }).where(eq(user.id, id));
}

async function seed(): Promise<void> {
	if (isProduction) {
		log('NODE_ENV=production: seed bloqueado. Crie o admin manualmente.');
		process.exitCode = 1;
		return;
	}

	const [existing] = await db
		.select({ id: user.id, role: user.role })
		.from(user)
		.where(eq(user.email, SEED_EMAIL))
		.limit(1);

	if (existing) {
		if (existing.role?.split(',').includes('admin')) {
			log(`${SEED_EMAIL} já existe e é admin. Nada a fazer.`);
			return;
		}
		await promoteToAdmin(existing.id);
		log(`${SEED_EMAIL} já existia; promovido a admin.`);
		return;
	}

	const baseUrl = `http://localhost:${env.PORT}`;

	const response = await fetch(`${baseUrl}/auth/sign-up/email`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// Better Auth recusa requisições sem Origin (proteção CSRF).
			Origin: env.BETTER_AUTH_URL,
		},
		body: JSON.stringify({ name: SEED_NAME, email: SEED_EMAIL, password: SEED_PASSWORD }),
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`falha ao criar usuário (HTTP ${response.status}): ${body}`);
	}

	const [created] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, SEED_EMAIL))
		.limit(1);

	if (!created) {
		throw new Error('usuário não encontrado após o cadastro');
	}

	await promoteToAdmin(created.id);

	log(`admin criado: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
	log('troque a senha antes de expor esta aplicação.');
}

seed()
	.catch((error: unknown) => {
		log(`erro: ${error instanceof Error ? error.message : String(error)}`);
		process.exitCode = 1;
	})
	.finally(() => {
		void queryClient.end({ timeout: 5 });
	});
