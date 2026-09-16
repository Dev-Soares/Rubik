import { useState } from 'react';
import { UsersTable } from '@/modules/users/components/UsersTable';
import { useUsers } from '@/modules/users/hooks/useUsers';
import { Button } from '@/shared/components/ui/button';

const PAGE_SIZE = 20;

type UsersPanelProps = {
	currentUserId: string;
};

export function UsersPanel({ currentUserId }: UsersPanelProps) {
	const [page, setPage] = useState(0);
	const { data } = useUsers(page, PAGE_SIZE);

	const lastPage = Math.max(0, Math.ceil(data.total / PAGE_SIZE) - 1);

	return (
		<div className="flex flex-col gap-4">
			<UsersTable users={data.items} currentUserId={currentUserId} />

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground text-sm">
					{data.total} {data.total === 1 ? 'usuário' : 'usuários'}
				</span>

				<div className="flex gap-2">
					<Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
						Anterior
					</Button>
					<Button
						variant="outline"
						disabled={page >= lastPage}
						onClick={() => setPage((p) => p + 1)}
					>
						Próxima
					</Button>
				</div>
			</div>
		</div>
	);
}
