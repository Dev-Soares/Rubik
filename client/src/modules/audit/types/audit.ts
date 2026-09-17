/** Espelha `AUDIT_ACTIONS` do backend (`server/src/modules/audit/types/audit.types.ts`). */
export const AUDIT_ACTIONS = ['create', 'update', 'delete'] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
	create: 'Criou',
	update: 'Alterou',
	delete: 'Removeu',
};

/**
 * Rótulo em pt-BR do recurso afetado. A chave é o primeiro segmento da rota
 * (`/users/:id` → `users`); recurso ainda não mapeado aparece como veio.
 */
export const AUDIT_ENTITY_LABELS: Record<string, string> = {
	users: 'Usuários',
	roles: 'Cargos',
};

/** Singular do recurso, para a frase da linha do tempo ("removeu um Cargo"). */
export const AUDIT_ENTITY_SINGULAR: Record<string, string> = {
	users: 'um Usuário',
	roles: 'um Cargo',
};

export type AuditLogEntry = {
	id: string;
	userId: string | null;
	userName: string;
	userEmail: string;
	action: AuditAction;
	entity: string;
	entityId: string | null;
	method: string;
	path: string;
	ipAddress: string | null;
	createdAt: string;
};

/** Um dia da linha do tempo, com as movimentações daquele dia. */
export type AuditDayGroup = {
	/** `YYYY-MM-DD`, usado como chave da lista. */
	day: string;
	entries: AuditLogEntry[];
};

export type AuditFilters = {
	/** Nome ou e-mail de quem fez a ação. */
	search?: string;
	action?: AuditAction;
	entity?: string;
	from?: string;
	to?: string;
};

export type PaginatedAuditLog = {
	items: AuditLogEntry[];
	total: number;
	limit: number;
	offset: number;
};
