import { createFileRoute } from '@tanstack/react-router';
import { AdminAuditGuarded } from '@/pages/AdminAuditGuarded';

export const Route = createFileRoute('/_auth/admin/audit')({
	component: AdminAuditGuarded,
});
