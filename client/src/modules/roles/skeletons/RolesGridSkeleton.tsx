import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

const CARDS = 4;
const MODULE_ROWS = 2;

/**
 * Montado com as mesmas peças do `RoleCard` — selo, descrição, rodapé com
 * borda e as linhas de módulo — em vez de um bloco de altura fixa. A altura do
 * card é dada pelo conteúdo (uma linha por módulo liberado), então um `h-*`
 * chutado errava para mais ou para menos e a grade saltava ao carregar.
 */
export function RolesGridSkeleton() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{Array.from({ length: CARDS }, (_, index) => (
				<Card key={index}>
					<CardContent className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<Skeleton className="h-6 w-28 rounded-full" />
							<Skeleton className="h-4 w-full" />
						</div>

						<div className="flex items-end justify-between gap-2 border-t pt-4">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="size-8 shrink-0 rounded-md" />
						</div>

						<div className="flex flex-col gap-1.5">
							{Array.from({ length: MODULE_ROWS }, (_, row) => (
								<div key={row} className="flex items-center gap-1.5">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-14 rounded-full" />
									<Skeleton className="h-4 w-14 rounded-full" />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
