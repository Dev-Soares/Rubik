import type { LucideIcon } from 'lucide-react';
import type { FileRouteTypes } from '@/routeTree.gen';

/** Um card de atalho da tela de início. */
export type HomeShortcut = {
	label: string;
	to: FileRouteTypes['to'];
	icon: LucideIcon;
	/** Categoria de origem na sidebar; ausente em item sem grupo. */
	group?: string;
};
