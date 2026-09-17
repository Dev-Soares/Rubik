import { useEffect, useState } from 'react';

/** Devolve o valor só depois de `delay` sem mudanças. Para campo de busca. */
export function useDebouncedValue<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timeout = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timeout);
	}, [value, delay]);

	return debounced;
}
