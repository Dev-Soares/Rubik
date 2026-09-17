import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { AppPending } from '@/pages/AppPending';
import { ErrorPage } from '@/pages/ErrorPage';
import { NotFound } from '@/pages/NotFound';
import { Toaster } from '@/shared/components/ui/sonner';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { ThemeProvider } from '@/shared/contexts/ThemeProvider';

type RouterContext = {
	queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
	notFoundComponent: NotFound,
	errorComponent: ErrorPage,
	pendingComponent: AppPending,
});

function RootLayout() {
	return (
		<ThemeProvider>
			{/* Sidebar recolhida usa Tooltip; o provider precisa envolver o app. */}
			<TooltipProvider delayDuration={200}>
				<Outlet />
			</TooltipProvider>
			<Toaster position="bottom-right" closeButton duration={4000} />
		</ThemeProvider>
	);
}
