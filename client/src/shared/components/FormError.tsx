import { AlertCircleIcon } from 'lucide-react';

type FormErrorProps = {
	message?: string | null;
};

/** Erro de submit do formulário, exibido acima das ações. */
export function FormError({ message }: FormErrorProps) {
	if (!message) {
		return null;
	}

	return (
		<p
			role="alert"
			className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg p-3 text-sm"
		>
			<AlertCircleIcon className="size-4 shrink-0" />
			{message}
		</p>
	);
}
