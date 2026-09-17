import { SCREEN_LABELS, SCREENS, type Screen } from '@/modules/roles/types/role';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';

type ScreensFieldProps = {
	value: Screen[];
	onChange: (value: Screen[]) => void;
	disabled?: boolean;
	error?: string;
};

export function ScreensField({ value, onChange, disabled, error }: ScreensFieldProps) {
	const toggle = (screen: Screen, checked: boolean) => {
		onChange(checked ? [...value, screen] : value.filter((item) => item !== screen));
	};

	return (
		<div className="flex flex-col gap-3">
			<Label>Telas visíveis</Label>

			<div className="flex flex-col gap-2">
				{SCREENS.map((screen) => (
					<div key={screen} className="flex items-center gap-2">
						<Checkbox
							id={`screen-${screen}`}
							checked={value.includes(screen)}
							onCheckedChange={(checked) => toggle(screen, checked === true)}
							disabled={disabled}
						/>
						<Label htmlFor={`screen-${screen}`} className="font-normal">
							{SCREEN_LABELS[screen]}
						</Label>
					</div>
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
