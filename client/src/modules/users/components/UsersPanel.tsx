import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { UsersTable } from '@/modules/users/components/UsersTable';
import { UserStatusTabs } from '@/modules/users/components/UserStatusTabs';
import { useUsers } from '@/modules/users/hooks/useUsers';
import type { UserStatusFilter } from '@/modules/users/types/user';
import { Button } from '@/shared/components/ui/button';

const PAGE_SIZE = 20;

type UsersPanelProps = {
	currentUserId: string;
};

export function UsersPanel({ currentUserId }: UsersPanelProps) {
	const [page, setPage] = useState(0);
	const [status, setStatus] = useState<UserStatusFilter>('todos');
	/*
	 * `isFetching`, e não `isPlaceholderData`: o tipo do `useSuspenseQuery`
	 * remove esse campo de propósito (`DistributiveOmit<..., 'isPlaceholderData'>`),
	 * porque na variante suspense o primeiro carregamento nunca chega a renderizar
	 * sem dado. Com `placeholderData` ligado, `isFetching` durante a troca de
	 * página é exatamente o momento em que a lista na tela é a anterior.
	 */
	const { data, isFetching } = useUsers(page, PAGE_SIZE, status === 'todos' ? undefined : status);

	const lastPage = Math.max(0, Math.ceil(data.total / PAGE_SIZE) - 1);

	/* Trocar de aba volta para a primeira página: a página 3 de "Todos" pode não
	 * existir em "Inativos", e a listagem viria vazia. */
	const changeStatus = (next: UserStatusFilter) => {
		setStatus(next);
		setPage(0);
	};

	return (
		<div className="flex flex-col gap-4">
			<UserStatusTabs value={status} onChange={changeStatus} />

			{/*
			 * Durante a troca de página a lista exibida é a anterior: esmaecer é o
			 * que diz que ela está sendo substituída, sem desmontar a tabela.
			 */}
			<div
				role="tabpanel"
				aria-labelledby={`user-tab-${status}`}
				className={cn(
					'transition-opacity duration-200',
					isFetching && 'pointer-events-none opacity-60',
				)}
				aria-busy={isFetching}
			>
				<UsersTable users={data.items} currentUserId={currentUserId} />
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground text-sm">
					{data.total} {data.total === 1 ? 'usuário' : 'usuários'}
				</span>

				<div className="flex gap-2">
					{/*
					 * `isFetching` também trava os botões: sem isso dois cliques
					 * rápidos pulam uma página, porque o segundo parte de um `page` que
					 * ainda não é o exibido.
					 */}
					<Button
						variant="outline"
						disabled={page === 0 || isFetching}
						onClick={() => setPage((p) => p - 1)}
					>
						Anterior
					</Button>
					<Button
						variant="outline"
						disabled={page >= lastPage || isFetching}
						onClick={() => setPage((p) => p + 1)}
					>
						Próxima
					</Button>
				</div>
			</div>
		</div>
	);
}
