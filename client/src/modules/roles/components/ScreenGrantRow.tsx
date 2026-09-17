import {
	SCREEN_GRANT_LABELS,
	SCREEN_GRANTS,
	SCREEN_LABELS,
	type Screen,
	type ScreenGrant,
} from '@/modules/roles/types/role';
import { SelectField } from '@/shared/components/SelectField';

const GRANT_OPTIONS = SCREEN_GRANTS.map((grant) => ({
	value: grant,
	label: SCREEN_GRANT_LABELS[grant],
}));

type ScreenGrantRowProps = {
	screen: Screen;
	grant: ScreenGrant;
	onChange: (grant: ScreenGrant) => void;
	disabled?: boolean;
};

export function ScreenGrantRow({ screen, grant, onChange, disabled }: ScreenGrantRowProps) {
	return (
		<SelectField
			label={SCREEN_LABELS[screen]}
			name={`screen-${screen}`}
			options={GRANT_OPTIONS}
			value={grant}
			onChange={(value) => onChange(value as ScreenGrant)}
			disabled={disabled}
		/>
	);
}
