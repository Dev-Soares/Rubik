import type { Request } from 'express';
import type { Session, User } from 'src/modules/auth/types/auth.types';

export type AuthenticatedRequest = Request & {
	user: User;
	session: Session;
};

export type OptionalAuthRequest = Request & {
	user?: User;
	session?: Session;
};
