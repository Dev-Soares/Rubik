import {
	SCREEN_ACCESS,
	SCREEN_ACCESS_LABELS,
	SCREEN_GRANT_LABELS,
	SCREEN_LABELS,
	type Screen,
	type ScreenAccess,
	type ScreenGrant,
} from '@/modules/roles/types/role';
import { SelectField } from '@/shared/components/SelectField';
import { Badge } from '@/shared/components/ui/badge';

/** O rótulo de "Pelo cargo" diz o que o cargo dá, para a escolha não ser às cegas. */
function accessOptions(inherited: ScreenGrant) {
	return SCREEN_ACCESS.map((access) => ({
		value: access,
		label:
			access === 'inherit'
				? `${SCREEN_ACCESS_LABELS.inherit} (${SCREEN_GRANT_LABELS[inherited].toLowerCase()})`
				: SCREEN_ACCESS_LABELS[access],
	}));
}

/** Rótulo curto do que vale na prática, já resolvido o `inherit`. */
function effectiveLabel(access: ScreenAccess, inherited: ScreenGrant): string {
	const grant = access === 'inherit' ? inherited : access;
	return SCREEN_GRANT_LABELS[grant];
}

type UserScreenAccessRowProps = {
	screen: Screen;
	access: ScreenAccess;
	/** Nível que o cargo do usuário dá nesta tela. */
	inherited: ScreenGrant;
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
	const effective = access === 'inherit' ? inherited : access;

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

			<Badge variant={effective === 'none' ? 'outline' : 'default'} className="mb-3 shrink-0">
				{effectiveLabel(access, inherited)}
			</Badge>
		</div>
	);
}
