import { BoxIcon } from 'lucide-react';

type AppLogoProps = {
	className?: string;
};

/** Marca do Rubik. Troque o ícone aqui para rebrandar o template inteiro. */
export function AppLogo({ className = 'size-6' }: AppLogoProps) {
	return <BoxIcon aria-label="Rubik" className={`text-primary ${className}`} strokeWidth={2} />;
}
