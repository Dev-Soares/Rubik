import { ACCESS_DECLARATION, type Action, type Module } from '@/modules/roles/types/role';

/**
 * O catálogo de permissões: o que a tela de cargos desenha como tabela.
 *
 * Existe separado de `ACCESS_DECLARATION` porque o que o backend precisa para
 * autorizar é só o par módulo/ação. Setor, título e descrição são apresentação
 * — mudam sem tocar em guard nenhum.
 *
 * `setor` agrupa a tabela do mesmo jeito que o menu lateral agrupa as abas: o
 * administrador procura a permissão onde ele já sabe que a tela mora.
 */
export type CatalogModule = {
	module: Module;
	title: string;
	/** O grupo do menu, para a tela agrupar como o menu agrupa. */
	sector: string;
	/** O que a pessoa deixa de fazer sem este módulo. */
	description: string;
};

export const PERMISSION_CATALOG: CatalogModule[] = [
	{
		module: 'usuarios',
		title: 'Usuários',
		sector: 'Administração',
		description: 'As contas do sistema: quem entra, com que cargo e com que permissão.',
	},
	{
		module: 'cargos',
		title: 'Cargos',
		sector: 'Administração',
		description: 'Os grupos de permissão. Quem mexe aqui decide o acesso de todo mundo.',
	},
	{
		module: 'auditoria',
		title: 'Registro de uso',
		sector: 'Administração',
		description: 'O histórico do que foi feito no sistema, por quem e quando.',
	},
];

/** Os setores na ordem em que aparecem no catálogo, sem repetir. */
export const SECTORS = [...new Set(PERMISSION_CATALOG.map((item) => item.sector))];

/**
 * As colunas da tabela. Módulo que não tem a ação mostra um traço na célula —
 * é o que deixa visível que auditoria não se cria nem se apaga.
 */
export const STANDARD_ACTIONS = ['ver', 'criar', 'editar', 'apagar'] as const;

export type StandardAction = (typeof STANDARD_ACTIONS)[number];

/** O módulo declara esta ação? */
export function hasAction(module: Module, action: StandardAction): boolean {
	return (ACCESS_DECLARATION[module] as readonly Action[]).includes(action);
}
