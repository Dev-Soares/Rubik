import { HomeShortcutCard } from '@/modules/home/components/HomeShortcutCard';
import { toShortcuts } from '@/modules/home/utils';
import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import { NAV_FOOTER_ITEMS, NAV_ITEMS } from '@/shared/navigation';

export function HomeShortcuts() {
	const { can, isPending } = useMyScreens();

	// Sem as permissões ainda, mostrar metade dos atalhos piscaria a lista.
	if (isPending) {
		return null;
	}

	// A própria tela de início não vira atalho: o card não levaria a lugar nenhum.
	const shortcuts = [...toShortcuts(NAV_ITEMS, can), ...toShortcuts(NAV_FOOTER_ITEMS, can)].filter(
		(shortcut) => shortcut.to !== '/inicio',
	);

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{shortcuts.map((shortcut) => (
				<HomeShortcutCard key={shortcut.to} shortcut={shortcut} />
			))}
		</div>
	);
}
