import { useNavigate, useSearch } from '@tanstack/react-router';
import type { GuideSection } from '@/modules/guide/types/guide';

/**
 * Seção aberta no guia. Mora no search param para que o link de uma seção
 * possa ser compartilhado e o voltar do navegador funcione.
 */
export function useActiveGuideSection(sections: GuideSection[]) {
	const { section: sectionId } = useSearch({ from: '/_auth/guide' });
	const navigate = useNavigate({ from: '/guide' });

	/* Id inválido ou ausente cai na primeira seção liberada, nunca em tela vazia. */
	const active = sections.find((section) => section.id === sectionId) ?? sections[0];

	const selectSection = (id: string) => {
		void navigate({ search: { section: id } });
	};

	return { active, selectSection };
}
