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
 * Roda de duas formas:
 *   - `pnpm db:seed`, na mão, em qualquer ambiente;
 *   - no boot do container, antes da API subir (ver o CMD do Dockerfile). Em
 *     produção, só quando a base ainda não tem nenhum usuário.
 *
 * ⚠️ A credencial default é a MESMA em todo projeto que clonar este template.
 * É conveniência de primeiro acesso, não uma conta de trabalho: troque a senha
 * no primeiro login, ou defina `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` no
 * ambiente para que este projeto nasça com credencial própria.
 */
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { auth } from 'src/modules/auth/auth';
import { isProduction } from 'src/config/env';
import { db, queryClient } from 'src/db/db.provider';
import { user } from 'src/db/schema/auth';
import { role } from 'src/db/schema/role';
import { SCREEN_PERMISSIONS } from 'src/modules/roles/types/role.types';

const SEED_NAME = process.env.SEED_ADMIN_NAME ?? 'Desenvolvedor';
const SEED_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'desenvolvedor@letsup.team';
const SEED_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? '123mudar';

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

/**
 * Há algum usuário nesta base?
 *
 * É o que distingue "primeiro boot" de "aplicação em uso". Em produção o seed
 * só roda quando a resposta é não: num sistema que já tem gente dentro, criar
 * um admin de credencial conhecida seria abrir uma porta, não inicializar.
 */
async function isFirstBoot(): Promise<boolean> {
	const [any] = await db.select({ id: user.id }).from(user).limit(1);
	return any === undefined;
}

async function seed(): Promise<void> {
	// Em produção o seed é de INICIALIZAÇÃO, não de manutenção: roda no primeiro
	// boot contra um banco vazio e nunca mais. Fora de produção roda sempre,
	// porque é o que faz `pnpm db:seed` reparar um ambiente local bagunçado.
	if (isProduction && !(await isFirstBoot())) {
		log('base já tem usuários: seed de inicialização ignorado.');
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
