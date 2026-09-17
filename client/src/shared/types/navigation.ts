import type { LucideIcon } from 'lucide-react';
import type { FileRouteTypes } from '@/routeTree.gen';
import type { Screen } from '@/modules/roles/types/role';

export type NavItem = {
	label: string;
	to: FileRouteTypes['to'];
	icon: LucideIcon;
	/** Quando presente, o item vira um grupo expansível na sidebar. */
	children?: NavChildItem[];
};

export type NavChildItem = {
	label: string;
	to: FileRouteTypes['to'];
	icon: LucideIcon;
	/** Chave da tela em `SCREENS`: só aparece se o cargo liberar. */
	screen?: Screen;
};
