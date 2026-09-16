import type { ReactNode } from 'react';
import { Header } from '@/shared/layouts/Header';

export function AppLayout({ children }: { children: ReactNode }) {
	return (
		<div className="bg-muted/40 min-h-dvh">
			<Header />
			<main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
		</div>
	);
}
