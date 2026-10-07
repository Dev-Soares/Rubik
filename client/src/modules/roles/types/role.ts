import { z } from 'zod';

/**
 * A declaração de acesso do sistema: cada módulo e as ações que se fazem sobre
 * ele. Espelha `ACCESS_DECLARATION` do backend
 * (`server/src/modules/roles/types/role.types.ts`): mudou lá, muda aqui.
 */
export const ACCESS_DECLARATION = {
	// `usuarios` não tem `criar` nem `apagar`: as duas ações são do plugin admin
	// do Better Auth, que exige a role `admin` em vez de permissão de tela. O
	// porquê está no backend, em `users.controller.ts`.
	usuarios: ['ver', 'editar'],
	cargos: ['ver', 'criar', 'editar', 'apagar'],
	auditoria: ['ver'],
} as const;

export type Module = keyof typeof ACCESS_DECLARATION;

export const MODULES = Object.keys(ACCESS_DECLARATION) as Module[];

export type Action<M extends Module = Module> = (typeof ACCESS_DECLARATION)[M][number];

/** Permissão concreta, no formato `<módulo>:<ação>` — é o que a API troca. */
export type Permission = {
	[M in Module]: `${M}:${Action<M>}`;
}[Module];

export const PERMISSIONS: Permission[] = MODULES.flatMap((module) =>
	ACCESS_DECLARATION[module].map((action) => `${module}:${action}` as Permission),
);

/** Rótulos em pt-BR dos módulos, para os formulários. */
export const MODULE_LABELS: Record<Module, string> = {
	usuarios: 'Usuários',
	cargos: 'Cargos',
	auditoria: 'Registro de uso',
};

/** Rótulos em pt-BR das ações, para a tabela de permissões. */
export const ACTION_LABELS: Record<Action, string> = {
	ver: 'Ver',
	criar: 'Criar',
	editar: 'Editar',
	apagar: 'Apagar',
};

/** O que cada ação permite, no `title` do botão. */
export const ACTION_HINTS: Record<Action, string> = {
	ver: 'Abrir o módulo e consultar o que há nele',
	criar: 'Cadastrar novos registros',
	editar: 'Alterar registros existentes',
	apagar: 'Remover registros',
};

export const ROLE_COLORS = [
	'primary',
	'blue',
	'green',
	'amber',
	'red',
	'purple',
	'neutral',
] as const;

export type RoleColor = (typeof ROLE_COLORS)[number];

export const ROLE_ICONS = [
	'escudo',
	'chave',
	'estrela',
	'pessoa',
	'pessoas',
	'maleta',
	'engrenagem',
	'grafico',
	'livro',
	'etiqueta',
] as const;

export type RoleIcon = (typeof ROLE_ICONS)[number];

export const roleFormSchema = z.object({
	name: z
		.string()
		.min(2, 'O nome deve ter no mínimo 2 caracteres.')
		.max(50, 'O nome deve ter no máximo 50 caracteres.'),
	description: z.string().max(200, 'A descrição deve ter no máximo 200 caracteres.').optional(),
	permissions: z.array(z.enum(PERMISSIONS as [Permission, ...Permission[]])),
	color: z.enum(ROLE_COLORS),
	icon: z.enum(ROLE_ICONS),
});

export type RoleFormInput = z.infer<typeof roleFormSchema>;

export type Role = {
	id: string;
	name: string;
	description: string | null;
	permissions: Permission[];
	color: RoleColor;
	icon: RoleIcon;
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
 * `PermissionOverride` do backend.
 */
export type PermissionOverride = {
	permission: Permission;
	allowed: boolean;
};

export type UserPermissions = {
	/** O que os cargos do usuário dão, antes das exceções. */
	inherited: Permission[];
	overrides: PermissionOverride[];
	/** O que o usuário pode de fato. */
	effective: Permission[];
};

/**
 * Estado de uma ação no formulário de exceções do usuário. `herda` não gera
 * exceção — a ação segue o cargo.
 */
export const ACTION_ACCESS = ['herda', 'libera', 'bloqueia'] as const;

export type ActionAccess = (typeof ACTION_ACCESS)[number];

export const ACTION_ACCESS_LABELS: Record<ActionAccess, string> = {
	herda: 'Pelo cargo',
	libera: 'Liberado',
	bloqueia: 'Bloqueado',
};

/** Estado do formulário de exceções: uma escolha por permissão. */
export type AccessByPermission = Record<Permission, ActionAccess>;
