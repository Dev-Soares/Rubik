import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin as adminPlugin, openAPI } from 'better-auth/plugins';
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
		disableSignUp: env.DISABLE_PUBLIC_SIGNUP,
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

	rateLimit: {
		enabled: isProduction,
		window: 60,
		max: 100,
		customRules: {
			'/sign-in/*': { window: 300, max: 5 },
			'/sign-up/*': { window: 600, max: 3 },
		},
	},

	advanced: {
		cookiePrefix: 'app',
		defaultCookieAttributes: {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? 'none' : 'lax',
		},
	},

	plugins: [adminPlugin(), ...(isProduction ? [] : [openAPI()])],
});
