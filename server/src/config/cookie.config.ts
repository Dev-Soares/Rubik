import type { CookieOptions } from 'express';
import { isProduction } from 'src/config/env';

export const cookieConfig: CookieOptions = {
	httpOnly: true,
	secure: isProduction,
	sameSite: isProduction ? 'none' : 'lax',
	path: '/',
};
