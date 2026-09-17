import { BoxIcon } from 'lucide-react';
import { cn } from 'cn';

type AppLogoProps = {
	className?: string;
};

/** Marca do Rubik. Troque o ícone aqui para rebrandar o template inteiro. */
export function AppLogo({ className }: AppLogoProps) {
	return <BoxIcon aria-label="Rubik" className={cn('text-primary size-6', className)} />;
}
