import { createContext } from 'react';
import type { ThemeContextValue } from '@/shared/types/theme';

export const THEME_STORAGE_KEY = 'theme';

export const ThemeContext = createContext<ThemeContextValue | null>(null);
