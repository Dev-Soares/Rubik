import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist', 'src/routeTree.gen.ts'] },
	{
		/*
		 * `recommendedTypeChecked`, e não `recommended`: as regras que pegam os
		 * erros que mais doem aqui — promise não aguardada, `await` em valor que
		 * não é promise — precisam do tipo, e sem elas o lint do client ficava
		 * mais frouxo que o do server para a mesma classe de bug.
		 */
		extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser,
			// `projectService` resolve o tsconfig de cada arquivo sozinho — aqui o
			// `tsconfig.json` é só um solution file com references, sem `include`.
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports', fixStyle: 'inline-type-imports' },
			],

			/*
			 * Paridade com o server. As duas valiam por disciplina e agora valem
			 * por portão:
			 *
			 * - `no-floating-promises`: `mutate()` solto num handler, `invalidateQueries`
			 *   sem `await` nem `void`. Falha silenciosa — a promise rejeita e
			 *   ninguém vê.
			 * - `no-console`: a saída do client é `shared/utils/logger.ts`, que é
			 *   onde um projeto derivado pluga Sentry sem tocar em mais nada
			 *   (`observabilidade.md`). `console` direto não é lido por ninguém em
			 *   produção.
			 */
			'@typescript-eslint/no-floating-promises': 'error',
			'no-console': 'error',

			// `recommendedTypeChecked` traz estas como `error`; no client elas
			// acusam principalmente o tipo largo de lib de terceiro, que não é
			// algo que a nossa tela resolve. Ficam como aviso.
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',

			/*
			 * `onSubmit={handleSubmit(...)}` é a assinatura do react-hook-form: o
			 * `handleSubmit` devolve promise de propósito, e ele mesmo captura a
			 * rejeição. Manter a regra ligada obrigaria um `void` em todo
			 * formulário do sistema, para proteger de algo que a lib já trata.
			 *
			 * `checksVoidReturn: false` desliga só esse caso — a checagem de
			 * promise em condicional e em `forEach` continua valendo.
			 */
			'@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
		},
	},
	{
		/*
		 * `throw redirect(...)` e `throw notFound()` são o fluxo de controle do
		 * TanStack Router: o `beforeLoad` interrompe a navegação lançando um
		 * objeto que o router intercepta, e não um `Error`. Desligado só em
		 * `routes/`, onde esse é o padrão documentado (`routes.md`) — no resto do
		 * client, lançar o que não é `Error` segue sendo erro.
		 */
		files: ['src/routes/**'],
		rules: {
			'@typescript-eslint/only-throw-error': 'off',
		},
	},
	{
		/*
		 * `logger.ts` é a saída de log do client (`observabilidade.md`): é o único
		 * lugar onde `console` é o destino certo, e é o que a regra protege em
		 * todos os outros arquivos.
		 */
		files: ['src/shared/utils/logger.ts'],
		rules: {
			'no-console': 'off',
		},
	},
	{
		// Componentes gerados pelo shadcn — não editamos à mão.
		// Exportam variants (cva) junto do componente, o que o react-refresh acusa.
		files: ['src/shared/components/ui/**'],
		rules: {
			'react-refresh/only-export-components': 'off',
		},
	},
);
