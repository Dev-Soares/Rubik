import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { queryClient } from '@/api/query-client';
import { ErrorPage } from '@/pages/ErrorPage';
import { NotFound } from '@/pages/NotFound';
import { routeTree } from '@/routeTree.gen';
import '@/styles/global.css';

const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultPreload: 'intent',
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
	// Telas de erro/404 do root valem para todas as rotas que não definirem a sua.
	defaultErrorComponent: ErrorPage,
	defaultNotFoundComponent: NotFound,
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Elemento #root não encontrado no index.html.');
}

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</StrictMode>,
);
