import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().int().positive().default(3000),

	DATABASE_URL: z.string().min(1),

	BETTER_AUTH_URL: z.url(),
	BETTER_AUTH_SECRET: z.string().min(32),

	CORS_ORIGIN: z.string().default(''),

	/**
	 * Chave que a integração de atendimento usa para marcar chamado como
	 * resolvido. Serviço externo não tem sessão de usuário, então a rota é
	 * autenticada por este segredo no header `x-api-key`.
	 */
	INTEGRATION_API_KEY: z.string().min(32),

	/**
	 * Sistema externo que recebe cada chamado aberto. Vazio desliga o envio —
	 * é o que permite rodar o template sem a integração configurada.
	 */
	TICKET_WEBHOOK_URL: z.string().default(''),
	/** Vai no header `x-api-key` da chamada ao sistema externo. */
	TICKET_WEBHOOK_API_KEY: z.string().default(''),
	/** Projeto que recebe os chamados desta instância no sistema externo. */
	TICKET_WEBHOOK_PROJECT_ID: z.string().default(''),
	/** Teto de espera do envio, em ms: sem isto a abertura trava se o externo pendurar. */
	TICKET_WEBHOOK_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),

	// Storage S3-compatível das fotos de chamado (AWS S3, Cloudflare R2, MinIO).
	// `S3_ENDPOINT` fica vazio na AWS; nos demais aponta para o host do bucket.
	S3_REGION: z.string().default('us-east-1'),
	S3_BUCKET: z.string().min(1),
	S3_ACCESS_KEY_ID: z.string().min(1),
	S3_SECRET_ACCESS_KEY: z.string().min(1),
	S3_ENDPOINT: z.string().default(''),
	/**
	 * Host que o navegador usa para baixar a foto. Existe porque em container o
	 * server fala com `http://minio:9000`, hostname da rede do compose que não
	 * resolve fora dela — assinar a URL com ele geraria link quebrado no
	 * cliente. Vazio: a URL é assinada com `S3_ENDPOINT` mesmo.
	 */
	S3_PUBLIC_ENDPOINT: z.string().default(''),
	/**
	 * MinIO e R2 exigem path-style (`<endpoint>/<bucket>/<key}`); a AWS usa
	 * virtual-host. Errar isto dá 404 no upload, não erro de credencial.
	 */
	S3_FORCE_PATH_STYLE: z
		.enum(['true', 'false'])
		.default('false')
		.transform((value) => value === 'true'),
	/** Validade da URL assinada de leitura, em segundos. */
	S3_SIGNED_URL_TTL: z.coerce.number().int().positive().default(900),

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
