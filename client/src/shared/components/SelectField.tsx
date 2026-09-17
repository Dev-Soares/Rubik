import { Label } from '@/shared/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';

export type SelectOption = {
	value: string;
	label: string;
};

type SelectFieldProps = {
	label: string;
	options: SelectOption[];
	value?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	name?: string;
	placeholder?: string;
	error?: string;
	hint?: string;
	disabled?: boolean;
};

/** Select do shadcn com o mesmo label e espaçamento do FormField. */
export function SelectField({
	label,
	options,
	value,
	onChange,
	onBlur,
	name,
	placeholder = 'Selecione...',
	error,
	hint,
	disabled,
}: SelectFieldProps) {
	const fieldId = name ?? label;

	return (
		<div className="flex flex-col gap-2">
			<Label
				htmlFor={fieldId}
				className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
			>
				{label}
			</Label>

			<Select value={value} onValueChange={onChange} disabled={disabled} name={name}>
				<SelectTrigger
					id={fieldId}
					onBlur={onBlur}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? `${fieldId}-error` : undefined}
					className="h-11! w-full text-sm"
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>

				{/*
				 * `popper` abre abaixo do trigger. O padrão (`item-aligned`) posiciona
				 * o menu por cima do campo, imitando o select nativo.
				 */}
				<SelectContent
					position="popper"
					sideOffset={6}
					align="start"
					className="w-(--radix-select-trigger-width) shadow-lg"
				>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value} className="h-10">
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

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
