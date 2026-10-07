import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { queryClient } from '@/api/query-client';
import { ErrorPage } from '@/pages/ErrorPage';
import { NotFound } from '@/pages/NotFound';
import { routeTree } from '@/routeTree.gen';
import { AppErrorBoundary } from '@/shared/components/AppErrorBoundary';
import '@/styles/global.css';

/**
 * Mesma janela do `staleTime` do QueryClient (`api/query-client.ts`). Os dois
 * precisam concordar: o router decide se revalida o loader, o QueryClient se
 * revalida a query, e com valores diferentes um refaz o que o outro acabou de
 * considerar fresco.
 */
const DADOS_FRESCOS_MS = 1000 * 60;

const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultPreload: 'intent',
	/*
	 * Hover de passagem não é intenção de navegar. Com o padrão (50ms),
	 * atravessar a sidebar com o mouse dispara o loader de cada item no caminho
	 * — requisições que ninguém pediu competindo com o clique que vem.
	 */
	defaultPreloadDelay: 1000,
	/*
	 * Aqui estava `0`, e era o que anulava o `defaultPreload` acima: o dado
	 * pré-carregado no hover nascia obsoleto, então o clique seguinte refazia a
	 * mesma requisição e a espera era integral. Preload só vale se o resultado
	 * sobreviver até o clique.
	 */
	defaultPreloadStaleTime: DADOS_FRESCOS_MS,
	defaultStaleTime: DADOS_FRESCOS_MS,
	defaultGcTime: DADOS_FRESCOS_MS * 5,
	/*
	 * O padrão é 1000ms: por um segundo inteiro a navegação não pinta NADA —
	 * nem esqueleto, nem item de menu aceso. Loader que resolve em 400ms cabe
	 * todo dentro dessa janela, então o `pendingComponent` nunca chegava a
	 * renderizar e `PageSkeleton`/`AuthPending` eram código morto na prática.
	 * A tela ficava parada e o app parecia travado — sem nenhuma requisição
	 * lenta envolvida.
	 *
	 * O `MinMs` é o par obrigatório: sem ele, loader que resolve em 310ms
	 * mostra o esqueleto por 10ms e o flash fica pior que a espera.
	 */
	defaultPendingMs: 300,
	defaultPendingMinMs: 200,
	scrollRestoration: true,
	// `auto` anima o scroll ao restaurar: a página desliza depois de já ter
	// trocado, e a navegação parece mais lenta do que foi.
	scrollRestorationBehavior: 'instant',
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
		{/* Fora do RouterProvider de propósito: assim um erro no próprio router
		    ainda encontra um boundary acima dele. */}
		<AppErrorBoundary>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</AppErrorBoundary>
	</StrictMode>,
);
