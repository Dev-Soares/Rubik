import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/shared/hooks/useTheme';

export function ToggleTheme() {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
		>
			{theme === 'dark' ? <SunIcon /> : <MoonIcon />}
		</Button>
	);
}
