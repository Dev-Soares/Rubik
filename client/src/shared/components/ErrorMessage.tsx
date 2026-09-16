import { AlertCircleIcon } from 'lucide-react';

type ErrorMessageProps = {
	message?: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
	if (!message) {
		return null;
	}

	return (
		<p role="alert" className="text-destructive flex items-center gap-1.5 text-sm">
			<AlertCircleIcon className="size-4" />
			{message}
		</p>
	);
}
