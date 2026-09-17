import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().int().positive().default(3000),

	DATABASE_URL: z.string().min(1),

	BETTER_AUTH_URL: z.url(),
	BETTER_AUTH_SECRET: z.string().min(32),

	CORS_ORIGIN: z.string().default(''),

	LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('info'),
	SWAGGER_USER: z.string().default('admin'),
	SWAGGER_PASSWORD: z.string().default('admin'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
	for (const issue of result.error.issues) {
		// eslint-disable-next-line no-console -- o logger ainda não existe neste ponto do boot
		console.error(`[env] ${issue.path.join('.')}: ${issue.message}`);
	}
	process.exit(1);
}

export const env = result.data;

export const isProduction = env.NODE_ENV === 'production';

export const corsOrigins = env.CORS_ORIGIN
	? env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
	: [];
