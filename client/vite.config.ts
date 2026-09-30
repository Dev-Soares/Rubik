import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

import pkg from './package.json' with { type: 'json' };

// Em container, o bind mount não propaga eventos nativos de fs (Windows/macOS):
// sem polling o HMR não dispara.
const isDocker = process.env.DOCKER === 'true';

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
		port: 3001,
		host: true,
		watch: isDocker ? { usePolling: true, interval: 300 } : undefined,
	},
});
