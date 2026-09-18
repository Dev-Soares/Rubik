import {
	BellIcon,
	CompassIcon,
	IdCardIcon,
	LogInIcon,
	ScrollTextIcon,
	TicketIcon,
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
				title: 'Início — onde você chega',
				description:
					'A tela que abre ao entrar. Traz um atalho para cada aba liberada para você, então serve de ponto de partida quando estiver em dúvida.',
			},
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
			},
			{
				title: 'Cargos — o que cada pessoa vê',
				description:
					'Grupos de permissão: o cargo decide quais abas aparecem no menu de quem o utiliza e o que pode ser alterado nelas.',
				screen: 'admin.roles',
			},
			{
				title: 'Registro de uso — histórico',
				description:
					'Tudo que foi alterado no sistema, com autor e horário. Somente leitura.',
				screen: 'admin.audit',
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
		id: 'notificacoes',
		group: 'Sua conta',
		label: 'Notificações',
		title: 'Notificações',
		description: 'Os avisos que o sistema envia para você e como acompanhá-los.',
		icon: BellIcon,
		to: '/notifications',
		steps: [
			{
				title: 'Acompanhe pelo sino',
				description:
					'O sino no topo da tela mostra quantos avisos você ainda não leu. Clique nele para ver os mais recentes sem sair da página em que está.',
			},
			{
				title: 'Abra um aviso',
				description:
					'Clicar em um aviso o marca como lido e, quando ele aponta para alguma tela, leva você direto até ela.',
			},
			{
				title: 'Veja a lista completa',
				description:
					'"Ver todas" abre a página de notificações, com o histórico inteiro. Alterne entre "Todas" e "Não lidas" para filtrar.',
			},
			{
				title: 'Marque como lida sem abrir',
				description:
					'O duplo check na linha do aviso o marca como lido sem levar você a lugar nenhum — útil para o que já se resolveu sozinho. "Marcar todas como lidas" zera o contador do sino de uma vez.',
			},
		],
		note: {
			title: 'Os avisos são só seus',
			description:
				'Cada pessoa vê apenas as próprias notificações — nem administradores acessam a lista de outro usuário. Nada sai da lista: o histórico fica, e o duplo check azul indica o que já foi lido.',
		},
	},
	{
		id: 'tickets',
		group: 'Sua conta',
		label: 'Solicitar ajuda',
		title: 'Solicitar ajuda',
		description: 'Abertura de chamados para a equipe, com fotos do problema.',
		icon: TicketIcon,
		to: '/tickets',
		steps: [
			{
				title: 'Abra a aba Solicitar ajuda',
				description:
					'Ela fica no rodapé do menu lateral, logo abaixo de "Como usar". A lista traz os chamados já abertos, do mais recente para o mais antigo.',
			},
			{
				title: 'Registre o chamado',
				description:
					'Clique em "Nos envie seu problema" e escreva, em uma frase, o que está acontecendo. É o único campo obrigatório.',
			},
			{
				title: 'Anexe fotos, se ajudarem',
				description:
					'Cole uma imagem com Ctrl+V ou use "Adicionar foto" para enviar até três imagens. Uma foto da tela ou do equipamento costuma poupar toda uma troca de mensagens.',
			},
			{
				title: 'Acompanhe pela lista',
				description:
					'Ao confirmar, o chamado entra no topo de "Abertos" com seu nome e o horário. Alterne para "Resolvidos" para ver o que a equipe já atendeu.',
			},
			{
				title: 'Saiba quando for resolvido',
				description:
					'Assim que a equipe resolve um chamado seu, você recebe um aviso no sino e um número aparece ao lado de "Solicitar ajuda" no menu. O número some quando você abre a aba.',
			},
		],
		note: {
			title: 'Todos veem todos os chamados',
			description:
				'A aba é aberta a qualquer pessoa com acesso ao sistema, e o chamado não pode ser editado nem apagado depois de enviado. Quem marca um chamado como resolvido é a equipe de atendimento, fora desta tela. Não escreva senhas nem dados pessoais no título, e confira a foto antes de anexá-la.',
		},
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
					'No menu de três pontos da linha, escolha "Editar" para mudar o nome e o cargo. O cargo define quais abas a pessoa enxerga, e a mudança vale na próxima vez que ela carregar o sistema. Você não pode alterar o seu próprio cargo.',
			},
			{
				title: 'Personalize as permissões de uma pessoa',
				description:
					'Ainda no menu, "Permissões" abre uma escolha por aba: "Pelo cargo", "Sem acesso", "Somente ler" ou "Ler e editar" — o que você marcar aqui vale acima do que o cargo define.',
			},
			{
				title: 'Recupere ou encerre um acesso',
				description:
					'"Alterar senha" define uma senha nova sem pedir a atual, para quando alguém perde o acesso — a pessoa pode trocá-la depois no perfil. "Excluir" pede confirmação e encerra o acesso de vez.',
			},
		],
		note: {
			title: 'A permissão da pessoa vence o cargo',
			description:
				'Aba deixada em "Pelo cargo" continua acompanhando o cargo; qualquer outra escolha ignora o cargo e não muda mais se o cargo mudar. Use como exceção pontual — para acesso que vale para várias pessoas, o lugar é o cargo. Administradores não têm a opção "Permissões": eles têm acesso total.',
		},
	},
	{
		id: 'cargos',
		group: 'Administração',
		label: 'Cargos',
		title: 'Cargos',
		description: 'Grupos de permissão que definem quais abas cada pessoa vê e edita.',
		icon: IdCardIcon,
		to: '/admin/roles',
		screen: 'admin.roles',
		steps: [
			{
				title: 'Entenda o que é um cargo',
				description:
					'Um cargo é um conjunto de telas liberadas, cada uma com um nível. Todo usuário tem um cargo, e é ele que decide o que aparece no menu lateral.',
			},
			{
				title: 'Escolha o nível de cada aba',
				description:
					'"Sem acesso" esconde a aba. "Somente ler" abre a aba, mas some com os botões que alteram dados. "Ler e editar" libera tudo dentro dela.',
			},
			{
				title: 'Crie um cargo',
				description:
					'Clique em "Novo cargo", dê um nome claro (ex: "Financeiro"), escreva uma descrição curta e escolha o nível de cada aba.',
			},
			{
				title: 'Ajuste o acesso liberado',
				description:
					'Editar um cargo muda o acesso de todos os usuários que o utilizam ao mesmo tempo. Libere só o necessário. Quem tiver permissão personalizada para aquela aba não é afetado.',
			},
			{
				title: 'Cargos do sistema',
				description:
					'Cargos marcados como "sistema" não podem ser excluídos: são a base do funcionamento. O cargo de administrador aparece como "Acesso total" e não é editável — quem é administrador lê e edita todas as abas, inclusive as criadas depois.',
			},
		],
		note: {
			title: 'Cargo sem tela nenhuma',
			description:
				'Um cargo com todas as abas em "Sem acesso" deixa a pessoa sem abas no menu lateral. Para excluir um cargo em uso, mova antes os usuários dele para outro cargo.',
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
