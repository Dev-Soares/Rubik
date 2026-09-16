import type { authClient } from '@/api/auth-client';

export type Session = typeof authClient.$Infer.Session;
export type User = Session['user'];
