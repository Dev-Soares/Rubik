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

	/**
	 * Dias que um chamado resolvido sobrevive antes da limpeza diária apagá-lo,
	 * junto das fotos no bucket. Conta a partir da resolução, não da abertura.
	 *
	 * O chamado é registro operacional: depois de resolvido e visto, ninguém
	 * volta nele. Sem teto, tabela e bucket crescem para sempre.
	 */
	TICKET_RETENTION_DAYS: z.coerce.number().int().positive().default(30),

	/**
	 * Storage das fotos de chamado (AWS S3 ou Cloudflare R2).
	 *
	 * Opcional de propósito: sem bucket configurado a aplicação sobe inteira e
	 * só o upload de foto fica desligado (ver `isStorageEnabled` abaixo). É o
	 * que permite clonar o template e rodar `pnpm dev` sem nenhuma credencial
	 * de nuvem na mão.
	 */
	S3_BUCKET: z.string().default(''),
	S3_ACCESS_KEY_ID: z.string().default(''),
	S3_SECRET_ACCESS_KEY: z.string().default(''),
	S3_REGION: z.string().default('us-east-1'),
	/** Vazio na AWS — o SDK resolve o host sozinho. R2 exige o endpoint da conta. */
	S3_ENDPOINT: z.string().default(''),
	/**
	 * R2 exige path-style (`<endpoint>/<bucket>/<key>`); a AWS usa virtual-host.
	 * Errar isto dá 404 no upload, não erro de credencial.
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

/**
 * Há bucket configurado? As três variáveis andam juntas: com qualquer uma
 * faltando o SDK só falharia na hora do upload, com erro de credencial que não
 * explica que o storage nunca foi configurado.
 */
export const isStorageEnabled =
	env.S3_BUCKET !== '' && env.S3_ACCESS_KEY_ID !== '' && env.S3_SECRET_ACCESS_KEY !== '';

export const corsOrigins = env.CORS_ORIGIN
	? env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
	: [];
