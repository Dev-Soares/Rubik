import { createFileRoute } from '@tanstack/react-router';
import { AdminUsersGuarded } from '@/pages/AdminUsersGuarded';

export const Route = createFileRoute('/_auth/admin/users')({
	component: AdminUsersGuarded,
});
