import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import { RoleBadge } from '@/modules/users/components/RoleBadge';
import { UserAvatar } from '@/modules/users/components/UserAvatar';
import { UserRowActions } from '@/modules/users/components/UserRowActions';
import type { User } from '@/modules/users/types/user';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui/table';

type UsersTableProps = {
	users: User[];
	currentUserId: string;
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

export function UsersTable({ users, currentUserId }: UsersTableProps) {
	const { can } = useMyScreens();

	const canWrite = can('admin.users', 'write');

	if (users.length === 0) {
		return <p className="text-muted-foreground py-8 text-center text-sm">Nenhum usuário.</p>;
	}

	return (
		<div className="rounded-xl border">
			{/*
			 * O padrão do shadcn (`p-2`) aperta demais uma linha com avatar. O respiro
			 * cresce a partir do `sm`: no celular o espaço horizontal é o que falta.
			 *
			 * `table-fixed` + truncagem no e-mail mantêm tudo dentro da largura: a
			 * tabela nunca rola de lado, nem reserva a barra de rolagem.
			 */}
			<Table className="table-fixed [&_td]:overflow-hidden [&_td]:px-3 [&_td]:py-4 [&_th]:h-12 [&_th]:px-3 sm:[&_td]:px-5 sm:[&_th]:px-5">
				<TableHeader>
					<TableRow>
						<TableHead>Usuário</TableHead>
						{/* E-mail e data saem no celular: nome e papel bastam para achar a linha. */}
						<TableHead className="hidden sm:table-cell">E-mail</TableHead>
						<TableHead className="w-24">Papel</TableHead>
						<TableHead className="hidden w-28 md:table-cell">Criado em</TableHead>
						<TableHead className="w-14" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell>
								<span className="flex min-w-0 items-center gap-3">
									<UserAvatar name={user.name} image={user.image} className="size-9 shrink-0" />
									<span className="truncate font-medium">{user.name}</span>
								</span>
							</TableCell>
							<TableCell className="text-muted-foreground hidden sm:table-cell">
								<span className="block truncate">{user.email}</span>
							</TableCell>
							<TableCell>
								<RoleBadge role={user.role} />
							</TableCell>
							<TableCell className="text-muted-foreground hidden md:table-cell">
								{dateFormatter.format(new Date(user.createdAt))}
							</TableCell>
							<TableCell>
								<span className="flex justify-end">
									{canWrite ? (
										<UserRowActions user={user} isSelf={user.id === currentUserId} />
									) : null}
								</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
