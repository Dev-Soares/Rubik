import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from 'src/config/env';
import * as schema from 'src/db/schema';

export const queryClient = postgres(env.DATABASE_URL);

export const db = drizzle(queryClient, { schema });

export const DB = Symbol('DB');
