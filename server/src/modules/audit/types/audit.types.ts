/** Ações registradas, derivadas do método HTTP da mutação. */
export const AUDIT_ACTIONS = ['create', 'update', 'delete'] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

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
	createdAt: Date;
};

/** Dados que o interceptor entrega ao service. O resto é do banco. */
export type RecordAuditInput = {
	userId: string | null;
	userName: string;
	userEmail: string;
	action: AuditAction;
	entity: string;
	entityId: string | null;
	method: string;
	path: string;
	ipAddress: string | null;
};
