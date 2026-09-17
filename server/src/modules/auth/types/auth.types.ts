import type { auth } from 'src/modules/auth/auth';

export type Auth = typeof auth;
export type Session = Auth['$Infer']['Session']['session'];
export type User = Auth['$Infer']['Session']['user'];
