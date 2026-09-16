import type { LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

type FormFieldProps = ComponentProps<typeof Input> & {
	label: string;
	error?: string;
	icon?: LucideIcon;
};

/** Input do shadcn com label, ícone opcional à esquerda e erro acessível. */
export function FormField({ label, error, icon: Icon, id, ...props }: FormFieldProps) {
	const fieldId = id ?? props.name;

	return (
		<div className="flex flex-col gap-1.5">
			<Label htmlFor={fieldId} className="text-muted-foreground text-sm font-normal">
				{label}
			</Label>

			<div className="relative">
				{Icon ? (
					<Icon
						aria-hidden
						className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
					/>
				) : null}
				<Input
					id={fieldId}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? `${fieldId}-error` : undefined}
					className={Icon ? 'h-11 pl-9' : 'h-11'}
					{...props}
				/>
			</div>

			{error ? (
				<span id={`${fieldId}-error`} role="alert" className="text-destructive text-xs">
					{error}
				</span>
			) : null}
		</div>
	);
}
