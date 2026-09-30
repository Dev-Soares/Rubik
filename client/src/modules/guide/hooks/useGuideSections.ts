import { GUIDE_SECTIONS } from '@/modules/guide/types/guideContent';
import { groupSections, isGuideItemVisible } from '@/modules/guide/utils';
import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Seções do guia visíveis ao usuário, já agrupadas para o índice e com os
 * passos restritos removidos.
 */
export function useGuideSections() {
	const { can, isPending } = useMyScreens();
	const { isAdmin } = useAuth();

	const sections = GUIDE_SECTIONS.filter((section) =>
		isGuideItemVisible(section, can, isAdmin),
	).map((section) => ({
		...section,
		steps: section.steps.filter((step) => isGuideItemVisible(step, can, isAdmin)),
	}));

	return { sections, groups: groupSections(sections), isPending };
}
