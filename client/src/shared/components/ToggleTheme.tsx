import { MoonIcon, SunIcon } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/shared/hooks/useTheme';

type ToggleThemeProps = {
	className?: string;
};

export function ToggleTheme({ className }: ToggleThemeProps) {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			className={cn('size-11', className)}
			onClick={toggleTheme}
			aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
		>
			{theme === 'dark' ? <SunIcon className="size-6" /> : <MoonIcon className="size-6" />}
		</Button>
	);
}
