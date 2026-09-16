import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { NotFound } from '@/pages/NotFound';
import { ThemeProvider } from '@/shared/contexts/ThemeProvider';
import { Toaster } from '@/shared/components/ui/sonner';

type RouterContext = {
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
	notFoundComponent: NotFound,
});

function RootLayout() {
	return (
		<ThemeProvider>
			<Outlet />
			<Toaster position="top-right" richColors />
		</ThemeProvider>
	);
}
