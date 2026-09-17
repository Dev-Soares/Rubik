/**
 * Cria o usuário administrador inicial.
 *
 * Idempotente: se o e-mail já existir, apenas garante a role `admin` e sai.
 *
 * O cadastro público está desativado (`disableSignUp`), e criar usuário pela
 * API de admin exigiria uma sessão de admin — que ainda não existe no primeiro
 * boot. Por isso o seed chama a API interna do Better Auth diretamente, que
 * gera o hash da senha do mesmo jeito que o fluxo normal.
 *
 * Uso: `pnpm db:seed`.
 */
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { auth } from 'src/modules/auth/auth';
import { isProduction } from 'src/config/env';
import { db, queryClient } from 'src/db/db.provider';
import { user } from 'src/db/schema/auth';
import { role } from 'src/db/schema/role';
import { SCREEN_PERMISSIONS } from 'src/modules/roles/types/role.types';

const SEED_NAME = process.env.SEED_ADMIN_NAME ?? 'Administrador';
const SEED_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@local.dev';
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';

function log(message: string): void {
	process.stdout.write(`[seed] ${message}\n`);
}

async function promoteToAdmin(id: string): Promise<void> {
	await db.update(user).set({ role: 'admin' }).where(eq(user.id, id));
}

/** Cargos de sistema: o RolesGuard depende de `admin` existir. */
async function seedSystemRoles(): Promise<void> {
	const systemRoles = [
		{
			name: 'admin',
			description: 'Acesso total ao sistema.',
			screens: SCREEN_PERMISSIONS.join(','),
		},
		{ name: 'user', description: 'Acesso às áreas comuns.', screens: '' },
	];

	for (const item of systemRoles) {
		const [existing] = await db
			.select({ id: role.id, screens: role.screens })
			.from(role)
			.where(eq(role.name, item.name))
			.limit(1);

		if (existing) {
			// Permissão nova em `SCREEN_PERMISSIONS` precisa chegar ao admin sem SQL manual.
			if (item.name === 'admin' && existing.screens !== item.screens) {
				await db.update(role).set({ screens: item.screens }).where(eq(role.id, existing.id));
				log('telas do cargo admin atualizadas');
			}
			continue;
		}

		await db.insert(role).values({ id: randomUUID(), isSystem: true, ...item });
		log(`cargo de sistema criado: ${item.name}`);
	}
}

async function seed(): Promise<void> {
	if (isProduction) {
		log('NODE_ENV=production: seed bloqueado. Crie o admin manualmente.');
		process.exitCode = 1;
		return;
	}

	await seedSystemRoles();

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

	// `createUser` do plugin admin não passa por `disableSignUp`.
	// Chamado server-side, sem sessão, pois este é o primeiro admin.
	const created = await auth.api.createUser({
		body: { name: SEED_NAME, email: SEED_EMAIL, password: SEED_PASSWORD, role: 'admin' },
	});

	if (!created.user?.id) {
		throw new Error('usuário não retornado pelo Better Auth');
	}

	await promoteToAdmin(created.user.id);

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
