import { z } from 'zod';

/**
 * Telas que um cargo pode liberar. Espelha `SCREENS` do backend
 * (`server/src/modules/roles/types/role.types.ts`): mudou lá, muda aqui.
 */
export const SCREENS = ['admin.users', 'admin.roles', 'admin.audit'] as const;

export type Screen = (typeof SCREENS)[number];

/** `read` abre a tela; `write` permite alterar o que há nela. */
export const SCREEN_LEVELS = ['read', 'write'] as const;

export type ScreenLevel = (typeof SCREEN_LEVELS)[number];

/** Permissão concreta, no formato `<tela>:<nível>` — é o que a API troca. */
export type ScreenPermission = `${Screen}:${ScreenLevel}`;

export const SCREEN_PERMISSIONS: ScreenPermission[] = SCREENS.flatMap((screen) =>
	SCREEN_LEVELS.map((level): ScreenPermission => `${screen}:${level}`),
);

/** Rótulos em pt-BR das telas, para os formulários. */
export const SCREEN_LABELS: Record<Screen, string> = {
	'admin.users': 'Usuários',
	'admin.roles': 'Cargos',
	'admin.audit': 'Registro de uso',
};

export const roleFormSchema = z.object({
	name: z
		.string()
		.min(2, 'O nome deve ter no mínimo 2 caracteres.')
		.max(50, 'O nome deve ter no máximo 50 caracteres.'),
	description: z.string().max(200, 'A descrição deve ter no máximo 200 caracteres.').optional(),
	screens: z.array(z.enum(SCREEN_PERMISSIONS as [ScreenPermission, ...ScreenPermission[]])),
});

export type RoleFormInput = z.infer<typeof roleFormSchema>;

export type Role = {
	id: string;
	name: string;
	description: string | null;
	screens: ScreenPermission[];
	isSystem: boolean;
	createdAt: string;
	updatedAt: string;
};

export type PaginatedRoles = {
	items: Role[];
	total: number;
	limit: number;
	offset: number;
};

/**
 * Exceção de permissão por usuário, acima do que o cargo define. Espelha
 * `ScreenOverride` do backend.
 */
export type ScreenOverride = {
	screen: ScreenPermission;
	allowed: boolean;
};

export type UserScreens = {
	/** O que os cargos do usuário dão, antes das exceções. */
	inherited: ScreenPermission[];
	overrides: ScreenOverride[];
	/** O que o usuário pode de fato. */
	effective: ScreenPermission[];
};

/**
 * Nível de acesso escolhido para uma tela, no formulário de cargo e no de
 * exceções. `none` não concede nada; `write` implica `read`.
 */
export const SCREEN_GRANTS = ['none', 'read', 'write'] as const;

export type ScreenGrant = (typeof SCREEN_GRANTS)[number];

export const SCREEN_GRANT_LABELS: Record<ScreenGrant, string> = {
	none: 'Sem acesso',
	read: 'Somente ler',
	write: 'Ler e editar',
};

/**
 * Curtos para os botões dentro do card, onde as opções dividem a largura. O
 * rótulo longo vai no `title`/`aria-label`, então nada se perde.
 */
export const SCREEN_GRANT_SHORT_LABELS: Record<ScreenGrant, string> = {
	none: 'Nenhum',
	read: 'Ler',
	write: 'Editar',
};

/** Estado do formulário de cargo: um nível por tela. */
export type GrantByScreen = Record<Screen, ScreenGrant>;

/**
 * Estado de uma tela no formulário de exceções do usuário. `inherit` não gera
 * exceção — a tela segue o cargo.
 */
export const SCREEN_ACCESS = ['inherit', 'none', 'read', 'write'] as const;

export type ScreenAccess = (typeof SCREEN_ACCESS)[number];

export const SCREEN_ACCESS_LABELS: Record<ScreenAccess, string> = {
	inherit: 'Pelo cargo',
	none: 'Sem acesso',
	read: 'Somente ler',
	write: 'Ler e editar',
};

/** Curtos para os botões do card — ver `SCREEN_GRANT_SHORT_LABELS`. */
export const SCREEN_ACCESS_SHORT_LABELS: Record<ScreenAccess, string> = {
	inherit: 'Cargo',
	none: 'Nenhum',
	read: 'Ler',
	write: 'Editar',
};

/** Estado do formulário de exceções: uma escolha por tela. */
export type AccessByScreen = Record<Screen, ScreenAccess>;
