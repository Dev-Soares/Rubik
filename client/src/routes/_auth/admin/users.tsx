import { createFileRoute } from '@tanstack/react-router';
import { AdminUsersGuarded } from '@/pages/AdminUsersGuarded';
import { myPermissionsQueryOptions } from '@/modules/roles/hooks/useMyPermissions';
import { usersQueryOptions } from '@/modules/users/hooks/useUsers';

export const Route = createFileRoute('/_auth/admin/users')({
	/*
	 * Sem isto a tela encadeava duas esperas: renderizava, pedia as permissões
	 * (`useMyPermissions`), e só depois de respondidas pedia a lista — cada ida
	 * ao servidor começando quando a anterior terminou. As duas são
	 * independentes, então saem juntas aqui, antes do primeiro render.
	 *
	 * A chave precisa ser a MESMA que o componente usa, senão o cache aquecido
	 * não é o lido. `UsersPanel` abre na primeira página com o filtro de
	 * situação em "todos", que vai para a query como `undefined` — e o `limit`
	 * fica no padrão do próprio `usersQueryOptions`, para os dois não divergirem.
	 */
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.ensureQueryData(myPermissionsQueryOptions),
			context.queryClient.ensureQueryData(usersQueryOptions(0)),
		]);
	},
	component: AdminUsersGuarded,
});
