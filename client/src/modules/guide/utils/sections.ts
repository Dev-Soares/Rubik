import type { GuideGroup, GuideRestricted, GuideSection } from '@/modules/guide/types/guide';
import type { Screen, ScreenLevel } from '@/modules/roles/types/role';

/**
 * Regra única de visibilidade do guia, aplicada a seções e a passos. Espelha a
 * da sidebar: quem manda é a permissão da tela, não o cargo.
 */
export function isGuideItemVisible(
	item: GuideRestricted,
	can: (screen: Screen, level?: ScreenLevel) => boolean,
): boolean {
	return !item.screen || can(item.screen);
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
