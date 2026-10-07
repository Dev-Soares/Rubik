import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

import pkg from './package.json' with { type: 'json' };

// Em container, o bind mount não propaga eventos nativos de fs (Windows/macOS):
// sem polling o HMR não dispara.
const isDocker = process.env.DOCKER === 'true';

/**
 * O que o polling NÃO precisa varrer.
 *
 * Com `usePolling`, cada ciclo dá um `stat()` em todo arquivo observado — e no
 * Docker Desktop isso atravessa a tradução de fs do Windows, que é o caminho
 * lento. Varrer `node_modules` nesse ritmo consome CPU constante com o container
 * parado, e nenhum destes diretórios gera HMR: dependência instalada não muda em
 * dev, `dist` é saída de build e `.tanstack` é o temporário do gerador de rotas.
 */
const WATCH_IGNORED = ['**/node_modules/**', '**/dist/**', '**/.tanstack/**'];

// `CLIENT_PORT` vem do `.env` da RAIZ, o mesmo arquivo que o compose lê. Em
// container a porta é sempre 3001 e o compose publica 1:1, então o valor da raiz
// só muda algo no caminho `dev:local`.
const rootEnv = loadEnv('development', path.resolve(import.meta.dirname, '..'), '');
const clientPort = isDocker ? 3001 : Number(rootEnv.CLIENT_PORT) || 3001;

/**
 * Para onde o proxy do dev manda as chamadas de API. Em container o alvo é o
 * serviço `server` na rede do compose; fora dele é o host, na porta publicada.
 */
const apiTarget = isDocker
	? 'http://server:3000'
	: `http://localhost:${Number(rootEnv.SERVER_PORT) || 3000}`;

/**
 * A API não tem prefixo: os controllers moram na raiz (`/roles`, `/users`...),
 * então o proxy lista as raízes em vez de casar um `/api` que não existe.
 *
 * Isto existe por causa do cookie de sessão. Client e API usam portas
 * diferentes, e porta distinta já é outra origem: com `sameSite: 'lax'` (o
 * valor de dev) o navegador NÃO manda o cookie numa chamada XHR entre origens,
 * e toda requisição chega sem sessão — a tela carrega logada e as permissões
 * voltam vazias. Passar para `sameSite: 'none'` não resolve em dev: o navegador
 * exige `Secure` junto, que exige HTTPS, que o dev em localhost não tem.
 *
 * Com o proxy o navegador enxerga UMA origem (a do Vite) e o cookie volta a ser
 * same-site. É também o que mais se parece com produção, onde client e API
 * ficam atrás do mesmo domínio.
 */
const API_ROUTES = [
	'/auth',
	'/audit',
	'/health',
	'/me',
	'/notifications',
	'/roles',
	'/tickets',
	'/users',
];

export default defineConfig({
	// A versão é congelada NO BUILD: o que a tela mostra é o que foi compilado,
	// sem valor de runtime que possa divergir do bundle servido.
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
		},
	},
	server: {
		port: clientPort,
		host: true,
		watch: isDocker ? { usePolling: true, interval: 1000, ignored: WATCH_IGNORED } : undefined,
		proxy: Object.fromEntries(
			API_ROUTES.map((route) => [route, { target: apiTarget, changeOrigin: false }]),
		),
	},
});
