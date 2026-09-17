import { EyeIcon, EyeOffIcon, type LucideIcon } from 'lucide-react';
import { useState, type ComponentProps } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

type FormFieldProps = ComponentProps<typeof Input> & {
	label: string;
	error?: string;
	icon?: LucideIcon;
	hint?: string;
};

/**
 * Input do shadcn com label, ícone opcional à esquerda e erro acessível.
 * Campos `type="password"` ganham botão para revelar a senha.
 */
export function FormField({
	label,
	error,
	icon: Icon,
	hint,
	id,
	type,
	...props
}: FormFieldProps) {
	const [revealed, setRevealed] = useState(false);

	const fieldId = id ?? props.name;
	const isPassword = type === 'password';
	const inputType = isPassword && revealed ? 'text' : type;

	return (
		<div className="flex flex-col gap-2">
			<Label
				htmlFor={fieldId}
				className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
			>
				{label}
			</Label>

			<div className="relative">
				{Icon ? (
					<Icon
						aria-hidden
						className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-60"
					/>
				) : null}

				<Input
					id={fieldId}
					type={inputType}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? `${fieldId}-error` : undefined}
					className={`h-11 ${Icon ? 'pl-9' : ''} ${isPassword ? 'pr-10' : ''}`}
					{...props}
				/>

				{isPassword ? (
					<button
						type="button"
						onClick={() => setRevealed((current) => !current)}
						aria-label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
						aria-pressed={revealed}
						className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
					>
						{revealed ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
					</button>
				) : null}
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
