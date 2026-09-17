import { createFileRoute } from '@tanstack/react-router';
import { AdminRolesGuarded } from '@/pages/AdminRolesGuarded';

export const Route = createFileRoute('/_auth/admin/roles')({
	component: AdminRolesGuarded,
});
