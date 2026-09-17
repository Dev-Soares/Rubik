import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '@/shared/hooks/useTheme';

/**
 * Toaster do sonner ligado ao tema e aos tokens do projeto.
 * Não usar `richColors`: ele aplica a paleta própria do sonner e ignora o tema.
 */
const Toaster = ({ ...props }: ToasterProps) => {
	const { theme } = useTheme();

	return (
		<Sonner
			theme={theme}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="text-primary size-4" />,
				info: <InfoIcon className="text-primary size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="text-destructive size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
					'--border-radius': 'var(--radius)',
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: 'app-toast',
					title: 'text-sm font-medium',
					description: 'text-muted-foreground text-xs',
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
