import { useRouter } from '@tanstack/react-router';
import { BellIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NotificationDropdown } from '@/modules/notifications/components/NotificationDropdown';
import { useUnreadCount } from '@/modules/notifications/hooks/useNotifications';
import { formatBadgeCount } from '@/shared/utils/badge';
import { Button } from '@/shared/components/ui/button';

export function NotificationBell() {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const { data } = useUnreadCount();
	const router = useRouter();

	const count = data?.count ?? 0;

	// Fecha ao trocar de tela: o painel é do cabeçalho, que sobrevive à
	// navegação, e sem isto continuaria aberto sobre a página nova. O guard em
	// `pathChanged` evita fechar quando só a query string muda.
	useEffect(
		() =>
			router.subscribe('onBeforeNavigate', ({ pathChanged }) => {
				if (pathChanged) {
					setIsOpen(false);
				}
			}),
		[router],
	);

	// Fecha ao clicar fora. O ref engloba o botão junto do painel de propósito:
	// se ele ficasse de fora, o `mousedown` no botão fecharia e o `click`
	// seguinte reabriria — o alternador nunca conseguiria fechar.
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handleMouseDown(event: MouseEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		window.addEventListener('mousedown', handleMouseDown);
		return () => window.removeEventListener('mousedown', handleMouseDown);
	}, [isOpen]);

	// Esc fecha sem exigir o mouse, como em qualquer painel sobreposto.
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setIsOpen(false);
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	return (
		<div className="relative" ref={containerRef}>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				aria-label={count > 0 ? `Notificações (${count} não lidas)` : 'Notificações'}
				aria-expanded={isOpen}
				onClick={() => setIsOpen((open) => !open)}
			>
				<BellIcon className="size-5" />

				{count > 0 ? (
					<span className="bg-destructive text-destructive-foreground absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums">
						{formatBadgeCount(count)}
					</span>
				) : null}
			</Button>

			{isOpen ? <NotificationDropdown onClose={() => setIsOpen(false)} /> : null}
		</div>
	);
}
