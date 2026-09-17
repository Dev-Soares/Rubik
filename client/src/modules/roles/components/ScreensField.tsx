import { ScreenGrantRow } from '@/modules/roles/components/ScreenGrantRow';
import { SCREENS, type ScreenGrant, type ScreenPermission } from '@/modules/roles/types/role';
import { toGrantByScreen, toPermissions } from '@/modules/roles/utils';
import { Label } from '@/shared/components/ui/label';

type ScreensFieldProps = {
	value: ScreenPermission[];
	onChange: (value: ScreenPermission[]) => void;
	disabled?: boolean;
	error?: string;
};

export function ScreensField({ value, onChange, disabled, error }: ScreensFieldProps) {
	const grants = toGrantByScreen(value);

	const change = (screen: (typeof SCREENS)[number], grant: ScreenGrant) => {
		onChange(toPermissions({ ...grants, [screen]: grant }));
	};

	return (
		<div className="flex flex-col gap-3">
			<Label>Acesso às telas</Label>

			<div className="flex flex-col gap-4">
				{SCREENS.map((screen) => (
					<ScreenGrantRow
						key={screen}
						screen={screen}
						grant={grants[screen]}
						disabled={disabled}
						onChange={(grant) => change(screen, grant)}
					/>
				))}
			</div>

			{error ? (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			) : null}
		</div>
	);
}
