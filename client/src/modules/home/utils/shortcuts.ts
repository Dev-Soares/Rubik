import type { HomeShortcut } from '@/modules/home/types/home';
import type { Screen, ScreenLevel } from '@/modules/roles/types/role';
import type { NavItem } from '@/shared/types/navigation';

/**
 * Achata os itens da sidebar em atalhos, mantendo só o que o usuário acessa.
 * Deriva de `NAV_ITEMS` de propósito: aba nova aparece aqui sem lista paralela.
 */
export function toShortcuts(
	items: readonly NavItem[],
	can: (screen: Screen, level?: ScreenLevel) => boolean,
): HomeShortcut[] {
	return items.flatMap((item): HomeShortcut[] => {
		if (!item.children) {
			return [{ label: item.label, to: item.to, icon: item.icon }];
		}

		return item.children
			.filter((child) => !child.screen || can(child.screen))
			.map((child) => ({
				label: child.label,
				to: child.to,
				icon: child.icon,
				/** O grupo da sidebar vira a legenda do card. */
				group: item.label,
			}));
	});
}
