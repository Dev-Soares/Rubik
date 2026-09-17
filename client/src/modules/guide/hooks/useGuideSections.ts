import { GUIDE_SECTIONS } from '@/modules/guide/types/guideContent';
import { groupSections, isGuideItemVisible } from '@/modules/guide/utils';
import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';

/**
 * Seções do guia visíveis ao usuário, já agrupadas para o índice e com os
 * passos restritos removidos.
 */
export function useGuideSections() {
	const { can, isPending } = useMyScreens();

	const sections = GUIDE_SECTIONS.filter((section) => isGuideItemVisible(section, can)).map(
		(section) => ({
			...section,
			steps: section.steps.filter((step) => isGuideItemVisible(step, can)),
		}),
	);

	return { sections, groups: groupSections(sections), isPending };
}
