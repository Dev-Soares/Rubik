import { eq, isNull, ne, or, type SQL } from 'drizzle-orm';
import { user } from 'src/db/schema/auth';
import type { UserStatus } from 'src/modules/users/types/user.types';

/**
 * `user.banned` é anulável — conta nunca inativada pode ter `NULL`, e `ne()`
 * sozinho descartaria essas linhas, porque `NULL <> true` é desconhecido em SQL.
 */
export function toBannedFilter(status: UserStatus): SQL | undefined {
	if (status === 'inativo') {
		return eq(user.banned, true);
	}

	return or(ne(user.banned, true), isNull(user.banned));
}
