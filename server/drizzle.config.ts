import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema',
	out: './src/db/migrations',
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
	migrations: {
		table: 'migrations',
		schema: 'drizzle',
	},
	breakpoints: true,
	strict: true,
	verbose: true,
});
