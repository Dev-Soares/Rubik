/**
 * A declaração de acesso do sistema: cada módulo e as ações que se fazem sobre
 * ele. É o contrato com o frontend — mudou aqui, muda em
 * `client/src/modules/roles/types/role.ts` e em `shared/navigation.ts`.
 *
 * As ações seguem um vocabulário comum, para a tela de cargos ler como uma
 * tabela: `ver`, `criar`, `editar` e `apagar`. Um módulo declara só as que
 * fazem sentido nele — auditoria é registro de uso, e não se cria nem se apaga
 * um log pela tela.
 *
 * Toda ação declarada aqui é conferida em algum lugar do código: acrescentar
 * uma é acrescentar também a porta que a confere (`@RequireAccess`).
 */
export const ACCESS_DECLARATION = {
	/*
	 * Sem `apagar`: conta não se exclui, se inativa — e inativar é do plugin
	 * admin do Better Auth, que exige a role `admin`, não permissão de tela
	 * (ver `users.controller.ts`).
	 *
	 * Sem `criar`: criar usuário também é do plugin admin
	 * (`authClient.admin.createUser`), pela mesma razão. Declarar as duas aqui
	 * dava ao administrador de cargos a ilusão de conceder algo — não havia
	 * `@RequireAccess` conferindo nenhuma delas.
	 */
	usuarios: ['ver', 'editar'],
	cargos: ['ver', 'criar', 'editar', 'apagar'],
	auditoria: ['ver'],
} as const;

export type Module = keyof typeof ACCESS_DECLARATION;

export const MODULES = Object.keys(ACCESS_DECLARATION) as Module[];

export type Action<M extends Module = Module> = (typeof ACCESS_DECLARATION)[M][number];

/**
 * Permissão concreta, no formato `<módulo>:<ação>` — é assim que ela viaja no
 * CSV de `role.permissions`, na coluna `user_permission_override.permission` e
 * na API.
 */
export type Permission = {
	[M in Module]: `${M}:${Action<M>}`;
}[Module];

/** Todas as permissões existentes, na ordem da declaração. */
export const PERMISSIONS: Permission[] = MODULES.flatMap((module) =>
	ACCESS_DECLARATION[module].map((action) => `${module}:${action}` as Permission),
);

/**
 * As cores do crachá do cargo. São nomes de token do tema, não cores soltas:
 * o desenho de cada uma mora na tela (`client/src/modules/roles/utils/badge.ts`).
 */
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

/** Os ícones que o crachá aceita. O desenho de cada um mora na tela. */
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

export type PublicRole = {
	id: string;
	name: string;
	description: string | null;
	permissions: Permission[];
	color: RoleColor;
	icon: RoleIcon;
	isSystem: boolean;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Exceção de permissão por usuário. `allowed: true` libera uma permissão que o
 * cargo não dá; `false` bloqueia uma que ele dá. Ausente herda do cargo.
 */
export type PermissionOverride = {
	permission: Permission;
	allowed: boolean;
};

/** Visualização de um usuário: o que o cargo dá, as exceções e o efetivo. */
export type UserPermissions = {
	/** União das permissões dos cargos do usuário, antes das exceções. */
	inherited: Permission[];
	overrides: PermissionOverride[];
	/** `(inherited ∪ grants) \ denies`, com toda ação implicando `ver`. */
	effective: Permission[];
};
