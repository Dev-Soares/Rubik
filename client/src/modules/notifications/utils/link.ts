import type { AnyRouter } from '@tanstack/react-router';

/**
 * O destino da notificação, se existir no app. Caso contrário `null`.
 *
 * O `link` vem de uma coluna de texto livre do banco, e `<Link to={...}>` do
 * TanStack Router LANÇA quando o destino não casa com nenhuma rota. Como o sino
 * fica no cabeçalho, uma linha com rota renomeada derrubava o
 * `AppErrorBoundary` e trocava a tela inteira pelo "Algo deu errado" — em
 * qualquer página, não só na de notificações.
 *
 * Validar na borda, e não confiar no dado do servidor, é o que `AGENTS.md` §1
 * pede. O item sem destino válido continua clicável para marcar como lido (ver
 * `NotificationItem`).
 */
export function resolveNotificationLink(router: AnyRouter, link: string | null): string | null {
	if (!link) {
		return null;
	}

	// Caminho relativo à raiz é o único formato que o router resolve. Barra dupla
	// é URL protocol-relative (`//host`), que escaparia do app.
	if (!link.startsWith('/') || link.startsWith('//')) {
		return null;
	}

	try {
		const [pathname] = link.split('?');
		const matches = router.matchRoutes(pathname, {});

		// Rota inexistente não devolve lista vazia: devolve a cadeia com a última
		// marcada como não encontrada.
		const matched = matches.length > 0 && !matches.some((match) => match._notFound);
		return matched ? link : null;
	} catch {
		return null;
	}
}
