import {
	SCREEN_ACCESS,
	SCREEN_ACCESS_LABELS,
	SCREEN_LABELS,
	type Screen,
	type ScreenAccess,
} from '@/modules/roles/types/role';
import { SelectField } from '@/shared/components/SelectField';
import { Badge } from '@/shared/components/ui/badge';

/** O rótulo de "Pelo cargo" diz o que o cargo dá, para a escolha não ser às cegas. */
function accessOptions(inherited: boolean) {
	return SCREEN_ACCESS.map((access) => ({
		value: access,
		label:
			access === 'inherit'
				? `${SCREEN_ACCESS_LABELS.inherit} (${inherited ? 'liberado' : 'bloqueado'})`
				: SCREEN_ACCESS_LABELS[access],
	}));
}

type UserScreenAccessRowProps = {
	screen: Screen;
	access: ScreenAccess;
	/** Se o cargo do usuário libera esta tela. */
	inherited: boolean;
	onChange: (access: ScreenAccess) => void;
	disabled?: boolean;
};

export function UserScreenAccessRow({
	screen,
	access,
	inherited,
	onChange,
	disabled,
}: UserScreenAccessRowProps) {
	const visible = access === 'inherit' ? inherited : access === 'allow';

	return (
		<div className="flex items-end justify-between gap-4">
			<SelectField
				label={SCREEN_LABELS[screen]}
				name={`screen-${screen}`}
				options={accessOptions(inherited)}
				value={access}
				onChange={(value) => onChange(value as ScreenAccess)}
				disabled={disabled}
			/>

			<Badge variant={visible ? 'default' : 'outline'} className="mb-3 shrink-0">
				{visible ? 'Vê' : 'Não vê'}
			</Badge>
		</div>
	);
}
