import { Trash2Icon } from 'lucide-react';
import { RoleBadge } from '@/modules/users/components/RoleBadge';
import { UserAvatar } from '@/modules/users/components/UserAvatar';
import { useDeleteUser } from '@/modules/users/hooks/useDeleteUser';
import type { User } from '@/modules/users/types/user';
import { Button } from '@/shared/components/ui/button';
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
	const { mutate: deleteUser, isPending, variables } = useDeleteUser();

	if (users.length === 0) {
		return <p className="text-muted-foreground py-8 text-center text-sm">Nenhum usuário.</p>;
	}

	return (
		<div className="overflow-x-auto rounded-xl border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Usuário</TableHead>
						<TableHead>E-mail</TableHead>
						<TableHead>Papel</TableHead>
						<TableHead>Criado em</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							<TableCell>
								<span className="flex items-center gap-2">
									<UserAvatar name={user.name} image={user.image} className="size-8" />
									<span className="font-medium">{user.name}</span>
								</span>
							</TableCell>
							<TableCell className="text-muted-foreground">{user.email}</TableCell>
							<TableCell>
								<RoleBadge role={user.role} />
							</TableCell>
							<TableCell className="text-muted-foreground">
								{dateFormatter.format(new Date(user.createdAt))}
							</TableCell>
							<TableCell className="text-right">
								{user.id === currentUserId ? null : (
									<Button
										variant="ghost"
										size="icon"
										aria-label={`Remover ${user.name}`}
										disabled={isPending && variables === user.id}
										onClick={() => deleteUser(user.id)}
									>
										<Trash2Icon />
									</Button>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
