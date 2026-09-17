import { GUIDE_SECTIONS } from '@/modules/guide/types/guideContent';
import { groupSections, isGuideItemVisible } from '@/modules/guide/utils';
import { useMyScreens } from '@/modules/roles/hooks/useMyScreens';
import { useAuth } from '@/shared/hooks/useAuth';

/**
 * Seções do guia visíveis ao usuário, já agrupadas para o índice e com os
 * passos restritos removidos.
 */
export function useGuideSections() {
	const { isAdmin } = useAuth();
	const { screens, isPending } = useMyScreens();

	const sections = GUIDE_SECTIONS.filter((section) =>
		isGuideItemVisible(section, isAdmin, screens),
	).map((section) => ({
		...section,
		steps: section.steps.filter((step) => isGuideItemVisible(step, isAdmin, screens)),
	}));

	return { sections, groups: groupSections(sections), isPending };
}
