import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin as adminPlugin } from 'better-auth/plugins';
import { corsOrigins, env, isProduction } from 'src/config/env';
import { db } from 'src/db/db.provider';
import { account, session, user, verification } from 'src/db/schema/auth';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_UPDATE_AGE = 60 * 60 * 24;
const SESSION_COOKIE_CACHE = 60 * 5;

export const auth = betterAuth({
	basePath: '/auth',
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,

	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: { user, session, account, verification },
	}),

	trustedOrigins: corsOrigins,

	emailAndPassword: {
		enabled: true,
		// Cadastro público desativado: usuários são criados por um admin, pelo
		// plugin admin daqui (`authClient.admin.createUser`, que exige a role
		// `admin`), ou pelo seed inicial. Não há rota nossa de criação.
		disableSignUp: true,
		minPasswordLength: 8,
	},

	session: {
		expiresIn: SESSION_MAX_AGE,
		updateAge: SESSION_UPDATE_AGE,
		cookieCache: {
			enabled: true,
			maxAge: SESSION_COOKIE_CACHE,
		},
	},

	/*
	 * Ligado em todo ambiente, e não só em produção.
	 *
	 * O `ThrottlerGuard` global do Nest não alcança estas rotas: o Better Auth é
	 * montado como middleware Express (`main.ts`), antes do pipeline de guards.
	 * Então este é o ÚNICO limite sobre o login — e com `enabled: isProduction`
	 * qualquer ambiente que não fosse exatamente `production` (homologação,
	 * staging) ficava sem proteção de força bruta, sem nada avisando.
	 *
	 * 5 tentativas em 5 minutos não incomoda ninguém em dev, e mantém dev e
	 * produção com o mesmo comportamento.
	 */
	rateLimit: {
		enabled: true,
		window: 60,
		max: 100,
		customRules: {
			'/sign-in/*': { window: 300, max: 5 },
			'/sign-up/*': { window: 600, max: 3 },
		},
	},

	advanced: {
		cookiePrefix: 'app',
		/*
		 * `sameSite: 'none'` em produção porque client e API ficam em domínios
		 * distintos no deploy (Railway), e `lax` não manda o cookie numa chamada
		 * entre origens — a tela carregaria deslogada. Exige `secure: true`, que
		 * está logo abaixo.
		 *
		 * O preço é que o navegador deixa de barrar CSRF por conta própria: quem
		 * barra passa a ser `trustedOrigins` (acima) junto do CORS. Projeto
		 * derivado que sirva client e API no MESMO domínio deve trocar para
		 * `'lax'` e recuperar essa proteção de graça.
		 */
		defaultCookieAttributes: {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? 'none' : 'lax',
		},
	},

	plugins: [adminPlugin()],
});
