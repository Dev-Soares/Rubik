import type { ReactNode } from 'react';
import { AppLogo } from '@/shared/components/AppLogo';
import { ToggleTheme } from '@/shared/components/ToggleTheme';

type AuthLayoutProps = {
	title: string;
	children: ReactNode;
};

export function AuthLayout({ title, children }: AuthLayoutProps) {
	return (
		<div className="bg-background flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
			<div className="absolute top-6 right-6">
				<ToggleTheme />
			</div>

			<div className="flex flex-col items-center gap-3">
				<AppLogo className="size-12" />
				<span className="text-xl font-bold tracking-tight">Rubik</span>
			</div>

			<div className="bg-muted/60 w-full max-w-sm rounded-2xl p-6">
				<h1 className="mb-5 text-base font-bold tracking-tight">{title}</h1>
				{children}
			</div>
		</div>
	);
}
