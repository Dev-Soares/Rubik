import { use } from 'react';
import { ThemeContext } from '@/shared/contexts/themeContext';
import type { ThemeContextValue } from '@/shared/types/theme';

export function useTheme(): ThemeContextValue {
	const context = use(ThemeContext);

	if (!context) {
		throw new Error('useTheme deve ser usado dentro de ThemeProvider.');
	}

	return context;
}
