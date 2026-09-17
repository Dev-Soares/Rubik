import { z } from 'zod';

/**
 * Telas que um cargo pode liberar. Espelha `SCREENS` do backend
 * (`server/src/modules/roles/types/role.types.ts`): mudou lá, muda aqui.
 */
export const SCREENS = ['admin.users', 'admin.roles', 'admin.audit'] as const;

export type Screen = (typeof SCREENS)[number];

/** Rótulos em pt-BR das telas, para os checkboxes do formulário. */
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
	screens: z.array(z.enum(SCREENS)),
});

export type RoleFormInput = z.infer<typeof roleFormSchema>;

export type Role = {
	id: string;
	name: string;
	description: string | null;
	screens: Screen[];
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
 * Exceção de tela por usuário, acima do que o cargo define. Espelha
 * `ScreenOverride` do backend.
 */
export type ScreenOverride = {
	screen: Screen;
	allowed: boolean;
};

export type UserScreens = {
	/** O que os cargos do usuário dão, antes das exceções. */
	inherited: Screen[];
	overrides: ScreenOverride[];
	/** O que o usuário enxerga de fato. */
	effective: Screen[];
};

/**
 * Estado de uma tela no formulário de visualização personalizada.
 * `inherit` não gera exceção — a tela segue o cargo.
 */
export const SCREEN_ACCESS = ['inherit', 'allow', 'deny'] as const;

export type ScreenAccess = (typeof SCREEN_ACCESS)[number];

export const SCREEN_ACCESS_LABELS: Record<ScreenAccess, string> = {
	inherit: 'Pelo cargo',
	allow: 'Liberado',
	deny: 'Bloqueado',
};

/** Estado do formulário de visualização: uma escolha por tela. */
export type AccessByScreen = Record<Screen, ScreenAccess>;
