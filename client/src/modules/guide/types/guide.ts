import type { LucideIcon } from 'lucide-react';
import type { FileRouteTypes } from '@/routeTree.gen';
import type { Screen } from '@/modules/roles/types/role';

/**
 * Um passo numerado dentro de uma seção do guia.
 *
 * `screen` segue a mesma regra da seção: um passo que descreve uma aba
 * restrita some para quem não a acessa, senão o guia promete tela que não abre.
 */
export type GuideStep = {
	title: string;
	description: string;
	screen?: Screen;
};

/** Observação destacada no rodapé da seção. */
export type GuideNote = {
	title: string;
	description: string;
};

/**
 * Uma seção do guia: normalmente uma aba do sistema.
 *
 * `screen` amarra a seção à mesma chave usada pela sidebar — quem não tem a
 * tela liberada não lê o guia dela.
 */
export type GuideSection = {
	id: string;
	/** Categoria do índice: seções com o mesmo `group` ficam juntas. */
	group: string;
	label: string;
	title: string;
	description: string;
	icon: LucideIcon;
	to?: FileRouteTypes['to'];
	screen?: Screen;
	steps: GuideStep[];
	note?: GuideNote;
};

/** Seções de uma categoria, na ordem em que a categoria aparece no índice. */
export type GuideGroup = {
	label: string;
	sections: GuideSection[];
};

/** O que seção e passo têm em comum para a regra de visibilidade. */
export type GuideRestricted = {
	screen?: Screen;
};
