import {
	CompassIcon,
	IdCardIcon,
	LogInIcon,
	ScrollTextIcon,
	UserRoundIcon,
	UsersIcon,
} from 'lucide-react';
import type { GuideSection } from '@/modules/guide/types/guide';

/**
 * Conteúdo do guia, uma seção por aba do sistema.
 *
 * Aba nova → seção nova aqui, com o mesmo `screen` usado em `NAV_ITEMS`,
 * senão o guia fica descrevendo tela que o usuário não vê. A ordem do array
 * é a ordem do índice; `group` é o que agrupa as seções nele.
 */
export const GUIDE_SECTIONS: GuideSection[] = [
	{
		id: 'visao-geral',
		group: 'Começando',
		label: 'Visão geral do sistema',
		title: 'Visão geral do sistema',
		description: 'O que cada área faz e onde encontrá-la no menu lateral.',
		icon: CompassIcon,
		steps: [
			{
				title: 'Perfil — sua conta',
				description:
					'Seus dados de acesso, troca de nome e troca de senha. Aberto pelo card com seu nome, no rodapé do menu lateral.',
			},
			{
				title: 'Usuários — quem tem acesso',
				description:
					'Cadastro de pessoas e definição do cargo de cada uma. Fica em Administração, no menu lateral.',
				screen: 'admin.users',
				role: 'admin',
			},
			{
				title: 'Cargos — o que cada pessoa vê',
				description:
					'Grupos de permissão: o cargo decide quais abas aparecem no menu de quem o utiliza.',
				screen: 'admin.roles',
				role: 'admin',
			},
			{
				title: 'Registro de uso — histórico',
				description:
					'Tudo que foi alterado no sistema, com autor e horário. Somente leitura.',
				screen: 'admin.audit',
				role: 'admin',
			},
			{
				title: 'Como usar — esta aba',
				description:
					'O passo a passo de cada tela. Você vê aqui somente as abas liberadas para o seu cargo.',
			},
		],
		note: {
			title: 'O menu lembra como você deixou',
			description:
				'As seções abrem e fecham ao clicar no título, e o sistema lembra o estado na próxima vez. O botão no topo encolhe a barra inteira para sobrar espaço na tela.',
		},
	},
	{
		id: 'primeiro-acesso',
		group: 'Começando',
		label: 'Primeiro acesso',
		title: 'Primeiro acesso',
		description: 'Como entrar no sistema e o que acontece quando a sessão expira.',
		icon: LogInIcon,
		steps: [
			{
				title: 'Informe e-mail e senha',
				description:
					'Use o e-mail cadastrado pelo administrador. Se ainda não tem acesso, peça a criação da conta a quem administra o sistema.',
			},
			{
				title: 'Troque a senha inicial',
				description:
					'A primeira senha é definida por quem criou sua conta. Vá em Perfil e troque por uma só sua.',
			},
			{
				title: 'Sessão ativa',
				description:
					'Depois de entrar, a sessão fica guardada no navegador. Você continua conectado ao fechar e reabrir a aba.',
			},
			{
				title: 'Sair',
				description:
					'O botão "Sair" fica no card do seu usuário, no rodapé do menu lateral, e também na aba Perfil.',
			},
		],
		note: {
			title: 'Pediu login de novo?',
			description:
				'Se a tela voltar para o login sem você ter saído, a sessão expirou. Basta entrar outra vez — nenhum dado é perdido.',
		},
	},
	{
		id: 'perfil',
		group: 'Sua conta',
		label: 'Perfil',
		title: 'Perfil',
		description: 'Seus dados de acesso, troca de nome e troca de senha.',
		icon: UserRoundIcon,
		to: '/profile',
		steps: [
			{
				title: 'Abra pelo rodapé do menu lateral',
				description:
					'O Perfil não fica na lista de abas: clique no card com seu nome, no rodapé do menu lateral, e escolha "Perfil".',
			},
			{
				title: 'Confira seus dados',
				description:
					'O card do topo mostra nome, e-mail, cargo e desde quando você faz parte da equipe. E-mail e cargo só o administrador altera.',
			},
			{
				title: 'Atualize seu nome',
				description:
					'Em "Dados da conta", edite o nome e salve. É esse nome que aparece para os outros usuários no sistema.',
			},
			{
				title: 'Troque a senha',
				description:
					'Em "Senha", informe a senha atual e a nova. Ao confirmar, as sessões abertas em outros dispositivos são encerradas.',
			},
		],
	},
	{
		id: 'usuarios',
		group: 'Administração',
		label: 'Usuários',
		title: 'Usuários',
		description: 'Cadastro de pessoas, definição de cargo e remoção de acesso.',
		icon: UsersIcon,
		to: '/admin/users',
		screen: 'admin.users',
		role: 'admin',
		steps: [
			{
				title: 'Veja quem tem acesso',
				description:
					'A tabela lista todos os usuários com nome, e-mail e cargo. Use a paginação no rodapé para percorrer a lista.',
			},
			{
				title: 'Crie um usuário',
				description:
					'Clique em "Novo usuário", preencha nome, e-mail, senha inicial e escolha o cargo. A pessoa já entra com esse acesso.',
			},
			{
				title: 'Troque o cargo de alguém',
				description:
					'O cargo define quais abas a pessoa enxerga. Alterando o cargo, as permissões mudam na próxima vez que ela carregar o sistema.',
			},
			{
				title: 'Personalize a visualização de uma pessoa',
				description:
					'Clique no ícone de olho na linha do usuário para abrir "Visualização personalizada". Para cada aba, escolha "Pelo cargo", "Liberado" ou "Bloqueado" — a escolha aqui vale acima do que o cargo define.',
			},
			{
				title: 'Remova o acesso',
				description:
					'Excluir o usuário encerra o acesso dele imediatamente. A ação não pode ser desfeita.',
			},
		],
		note: {
			title: 'A visualização vence o cargo',
			description:
				'Aba deixada em "Pelo cargo" continua acompanhando o cargo; "Liberado" ou "Bloqueado" ignora o cargo e não muda mais se o cargo mudar. Use como exceção pontual — para acesso que vale para várias pessoas, o lugar é o cargo. Administradores não aparecem com esse ícone: eles enxergam todas as abas.',
		},
	},
	{
		id: 'cargos',
		group: 'Administração',
		label: 'Cargos',
		title: 'Cargos',
		description: 'Grupos de permissão que definem quais abas cada pessoa vê.',
		icon: IdCardIcon,
		to: '/admin/roles',
		screen: 'admin.roles',
		role: 'admin',
		steps: [
			{
				title: 'Entenda o que é um cargo',
				description:
					'Um cargo é um conjunto de telas liberadas. Todo usuário tem um cargo, e é ele que decide o que aparece no menu lateral.',
			},
			{
				title: 'Crie um cargo',
				description:
					'Clique em "Novo cargo", dê um nome claro (ex: "Financeiro"), escreva uma descrição curta e marque as telas que ele libera.',
			},
			{
				title: 'Ajuste as telas liberadas',
				description:
					'Editar um cargo muda o acesso de todos os usuários que o utilizam ao mesmo tempo. Marque só o necessário. Quem tiver uma visualização personalizada para aquela aba não é afetado.',
			},
			{
				title: 'Cargos do sistema',
				description:
					'Cargos marcados como "sistema" não podem ser excluídos: são a base do funcionamento e garantem que sempre exista um acesso administrativo.',
			},
		],
		note: {
			title: 'Cargo sem tela nenhuma',
			description:
				'Um cargo sem telas marcadas deixa a pessoa sem abas no menu lateral. Para excluir um cargo em uso, mova antes os usuários dele para outro cargo.',
		},
	},
	{
		id: 'registro-de-uso',
		group: 'Administração',
		label: 'Registro de uso',
		title: 'Registro de uso',
		description: 'Histórico do que foi feito no sistema, por quem e quando.',
		icon: ScrollTextIcon,
		to: '/admin/audit',
		screen: 'admin.audit',
		role: 'admin',
		steps: [
			{
				title: 'Leia a linha do tempo',
				description:
					'Cada item mostra quem fez a ação, o que foi feito e o horário. Os eventos mais recentes aparecem primeiro.',
			},
			{
				title: 'Filtre o que procura',
				description:
					'Use os filtros do topo para reduzir a lista por usuário, tipo de ação ou período, até chegar ao evento que interessa.',
			},
			{
				title: 'Use para conferir mudanças',
				description:
					'Quando algo mudou e não se sabe por quê, o registro mostra a alteração e o responsável — útil para conferir trocas de cargo e exclusões.',
			},
		],
		note: {
			title: 'Somente leitura',
			description: 'Nada no registro pode ser editado ou apagado, nem por administradores.',
		},
	},
];
