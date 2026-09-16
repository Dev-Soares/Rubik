import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { THEME_STORAGE_KEY, ThemeContext } from '@/shared/contexts/themeContext';
import type { Theme } from '@/shared/types/theme';

/** Tema claro é o padrão do produto; o escuro é opt-in explícito do usuário. */
function getInitialTheme(): Theme {
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	return stored === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark');
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
	}, []);

	return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}
