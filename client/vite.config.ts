import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// Em container, o bind mount não propaga eventos nativos de fs (Windows/macOS):
// sem polling o HMR não dispara.
const isDocker = process.env.DOCKER === 'true';

export default defineConfig({
	plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
		},
	},
	server: {
		port: 5173,
		host: true,
		watch: isDocker ? { usePolling: true, interval: 300 } : undefined,
	},
});
