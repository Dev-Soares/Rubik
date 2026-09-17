import { GuideNav } from '@/modules/guide/components/GuideNav';
import { GuideSectionContent } from '@/modules/guide/components/GuideSectionContent';
import { useActiveGuideSection } from '@/modules/guide/hooks/useActiveGuideSection';
import { useGuideSections } from '@/modules/guide/hooks/useGuideSections';
import { GuideSkeleton } from '@/modules/guide/skeletons/GuideSkeleton';

export function GuidePanel() {
	const { sections, groups, isPending } = useGuideSections();
	const { active, selectSection } = useActiveGuideSection(sections);

	/*
	 * `useMyScreens` não suspende: sem o skeleton, o índice apareceria curto e
	 * cresceria sozinho quando as telas liberadas chegassem.
	 */
	if (isPending) {
		return <GuideSkeleton />;
	}

	if (!active) {
		return (
			<p className="text-muted-foreground text-sm">
				Seu cargo ainda não libera nenhuma tela. Peça acesso a quem administra o sistema.
			</p>
		);
	}

	return (
		<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12">
			<GuideNav groups={groups} activeId={active.id} onSelect={selectSection} />

			<GuideSectionContent section={active} />
		</div>
	);
}
