import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

import pkg from './package.json' with { type: 'json' };

// Em container, o bind mount não propaga eventos nativos de fs (Windows/macOS):
// sem polling o HMR não dispara.
const isDocker = process.env.DOCKER === 'true';

// `CLIENT_PORT` vem do `.env` da RAIZ, escrito por `scripts/ports.mjs` quando a
// padrão está ocupada por outro projeto da máquina. Em container a porta interna
// é sempre 3001 e quem desvia é o mapeamento do compose, então o arquivo da raiz
// só manda no caminho `dev:local`.
const rootEnv = loadEnv('development', path.resolve(import.meta.dirname, '..'), '');
const clientPort = isDocker ? 3001 : Number(rootEnv.CLIENT_PORT) || 3001;

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
		watch: isDocker ? { usePolling: true, interval: 300 } : undefined,
	},
});
