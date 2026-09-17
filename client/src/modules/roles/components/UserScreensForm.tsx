import { useState } from 'react';
import { useSetUserScreens } from '@/modules/roles/hooks/useSetUserScreens';
import { UserScreenAccessRow } from '@/modules/roles/components/UserScreenAccessRow';
import { SCREENS, type AccessByScreen, type UserScreens } from '@/modules/roles/types/role';
import { toAccessByScreen, toScreenOverrides } from '@/modules/roles/utils';
import { FormError } from '@/shared/components/FormError';
import { Button } from '@/shared/components/ui/button';
import { DialogClose, DialogFooter } from '@/shared/components/ui/dialog';

type UserScreensFormProps = {
	userId: string;
	screens: UserScreens;
	onDone?: () => void;
};

export function UserScreensForm({ userId, screens, onDone }: UserScreensFormProps) {
	const [access, setAccess] = useState<AccessByScreen>(() => toAccessByScreen(screens));
	const inherited = new Set(screens.inherited);

	const { mutate, isPending, error } = useSetUserScreens(userId, onDone);

	const handleSubmit = (event: React.SyntheticEvent) => {
		event.preventDefault();
		mutate(toScreenOverrides(access));
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-6">
			<fieldset disabled={isPending} className="contents">
				<div className="flex flex-col gap-4">
					{SCREENS.map((screen) => (
						<UserScreenAccessRow
							key={screen}
							screen={screen}
							access={access[screen]}
							inherited={inherited.has(screen)}
							disabled={isPending}
							onChange={(value) => setAccess((current) => ({ ...current, [screen]: value }))}
						/>
					))}
				</div>

				<FormError message={error?.message} />

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="ghost">
							Cancelar
						</Button>
					</DialogClose>
					<Button type="submit" disabled={isPending}>
						{isPending ? 'Salvando...' : 'Salvar visualização'}
					</Button>
				</DialogFooter>
			</fieldset>
		</form>
	);
}
