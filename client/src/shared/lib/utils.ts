import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Junta classes e resolve conflito de utilitário Tailwind (o último ganha).
 *
 * O caminho do arquivo é o que `components.json` aponta em `aliases.utils`:
 * é daqui que o `pnpm ui:add` importa o `cn` nos componentes que gera.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
