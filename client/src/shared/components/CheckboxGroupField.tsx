import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';

export type CheckboxOption = {
	value: string;
	label: string;
	description?: string;
};

type CheckboxGroupFieldProps = {
	label: string;
	options: CheckboxOption[];
	value: string[];
	onChange: (value: string[]) => void;
	onBlur?: () => void;
	name?: string;
	error?: string;
	hint?: string;
	disabled?: boolean;
};

/** Seleção múltipla com o mesmo label e espaçamento do FormField. */
export function CheckboxGroupField({
	label,
	options,
	value,
	onChange,
	onBlur,
	name,
	error,
	hint,
	disabled,
}: CheckboxGroupFieldProps) {
	const fieldId = name ?? label;

	function toggle(optionValue: string, checked: boolean) {
		// Reordena pela lista de opções: a ordem do CSV não depende de quem clicou primeiro.
		const selected = new Set(value);

		if (checked) {
			selected.add(optionValue);
		} else {
			selected.delete(optionValue);
		}

		onChange(options.map((option) => option.value).filter((option) => selected.has(option)));
	}

	return (
		<div className="flex flex-col gap-2">
			<Label
				id={`${fieldId}-label`}
				className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
			>
				{label}
			</Label>

			<div
				role="group"
				aria-labelledby={`${fieldId}-label`}
				aria-describedby={error ? `${fieldId}-error` : undefined}
				className="flex flex-col gap-1 rounded-lg border p-1"
			>
				{options.map((option) => {
					const optionId = `${fieldId}-${option.value}`;

					return (
						<Label
							key={option.value}
							htmlFor={optionId}
							className="hover:bg-muted flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 font-normal"
						>
							<Checkbox
								id={optionId}
								checked={value.includes(option.value)}
								onCheckedChange={(checked) => toggle(option.value, checked === true)}
								onBlur={onBlur}
								disabled={disabled}
								aria-invalid={Boolean(error)}
							/>
							<span className="flex flex-col gap-0.5">
								<span className="text-sm">{option.label}</span>
								{option.description ? (
									<span className="text-muted-foreground text-xs">{option.description}</span>
								) : null}
							</span>
						</Label>
					);
				})}
			</div>

			{error ? (
				<span id={`${fieldId}-error`} role="alert" className="text-destructive text-xs">
					{error}
				</span>
			) : hint ? (
				<span className="text-muted-foreground text-xs">{hint}</span>
			) : null}
		</div>
	);
}
