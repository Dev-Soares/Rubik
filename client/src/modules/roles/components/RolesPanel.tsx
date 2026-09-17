import { useState } from 'react';
import { RolesGrid } from '@/modules/roles/components/RolesGrid';
import { useRoles } from '@/modules/roles/hooks/useRoles';
import { Button } from '@/shared/components/ui/button';

const PAGE_SIZE = 20;

export function RolesPanel() {
	const [page, setPage] = useState(0);
	const { data } = useRoles(page, PAGE_SIZE);

	const lastPage = Math.max(0, Math.ceil(data.total / PAGE_SIZE) - 1);

	return (
		<div className="flex flex-col gap-4">
			<RolesGrid roles={data.items} />

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground text-sm">
					{data.total} {data.total === 1 ? 'cargo' : 'cargos'}
				</span>

				{/* Uma página só: dois botões permanentemente desabilitados só poluem. */}
				{lastPage === 0 ? null : (
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
				)}
			</div>
		</div>
	);
}
