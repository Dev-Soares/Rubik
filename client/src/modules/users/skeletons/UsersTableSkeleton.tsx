import { Skeleton } from '@/shared/components/ui/skeleton';

const ROWS = 5;

/**
 * Espelha a moldura, o cabeçalho e a altura de linha de `UsersTable`: sem isso
 * o conteúdo salta ao carregar — a linha real tem avatar `size-9` e `py-4`,
 * bem mais alta que uma barra solta, e o cabeçalho aparecia do nada.
 *
 * As colunas somem nos mesmos breakpoints da tabela (`sm` para e-mail, `md`
 * para a data).
 */
export function UsersTableSkeleton() {
	return (
		<div className="rounded-xl border">
			<div className="h-12 border-b" />

			{Array.from({ length: ROWS }, (_, index) => (
				<div
					key={index}
					className="flex items-center gap-3 border-b px-3 py-4 last:border-b-0 sm:px-5"
				>
					<Skeleton className="size-9 shrink-0 rounded-full" />
					<Skeleton className="h-4 flex-1" />
					<Skeleton className="hidden h-4 w-40 sm:block" />
					<Skeleton className="h-5 w-16 rounded-full" />
					<Skeleton className="hidden h-4 w-20 md:block" />
					<Skeleton className="size-8 shrink-0 rounded-md" />
				</div>
			))}
		</div>
	);
}
