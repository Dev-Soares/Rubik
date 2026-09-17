import type { GuideGroup, GuideRestricted, GuideSection } from '@/modules/guide/types/guide';
import type { Screen } from '@/modules/roles/types/role';

/**
 * Regra única de visibilidade do guia, aplicada a seções e a passos. Espelha a
 * da sidebar: a tela manda mais que a role, então um admin sem a tela liberada
 * também não lê o conteúdo dela.
 */
export function isGuideItemVisible(
	item: GuideRestricted,
	isAdmin: boolean,
	screens: Screen[],
): boolean {
	if (item.role === 'admin' && !isAdmin) {
		return false;
	}

	return !item.screen || screens.includes(item.screen);
}

/** Agrupa preservando a ordem em que cada categoria aparece nas seções. */
export function groupSections(sections: GuideSection[]): GuideGroup[] {
	const groups: GuideGroup[] = [];

	for (const section of sections) {
		const group = groups.find((candidate) => candidate.label === section.group);

		if (group) {
			group.sections.push(section);
			continue;
		}

		groups.push({ label: section.group, sections: [section] });
	}

	return groups;
}
