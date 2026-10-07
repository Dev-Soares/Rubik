/**
 * `pnpm setup` — prepara o HOST para rodar `pnpm dev:local`.
 *
 * Não é necessário para `pnpm dev`: lá tudo roda em container, a configuração
 * vem do compose e o próprio container migra e cria o admin antes de subir a
 * API. Este script existe para o caminho sem Docker no app, que precisa de
 * `server/.env` e das dependências instaladas na máquina.
 *
 * Idempotente: pode rodar de novo a qualquer momento. Nada aqui sobrescreve um
 * `.env` existente; quem já configurou o ambiente não perde nada.
 *
 * O que faz, nesta ordem:
 *   1. confere Node >= 22, pnpm e Docker;
 *   2. cria os `.env` a partir dos `.env.example`, com segredos aleatórios;
 *   3. instala as dependências;
 *   4. sobe o Postgres e aplica as migrations;
 *   5. cria o admin inicial.
 */
import { execFileSync, execSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const ok = (message) => console.log(`${GREEN}✓${RESET} ${message}`);
const skip = (message) => console.log(`${DIM}·${RESET} ${DIM}${message}${RESET}`);
const step = (message) => console.log(`\n${BOLD}${message}${RESET}`);
const warn = (message) => console.log(`${YELLOW}!${RESET} ${message}`);

function die(message, hint) {
	console.error(`\n${RED}✗ ${message}${RESET}`);
	if (hint) {
		console.error(`${DIM}  ${hint}${RESET}`);
	}
	process.exit(1);
}

/** Executa mostrando a saída ao vivo — install e migration demoram, silêncio assusta. */
function run(command, args) {
	execFileSync(command, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
}

function has(command) {
	try {
		execSync(process.platform === 'win32' ? `where ${command}` : `command -v ${command}`, {
			stdio: 'ignore',
		});
		return true;
	} catch {
		return false;
	}
}

// ---- 1. Pré-requisitos ------------------------------------------------------

step('Verificando pré-requisitos');

const major = Number(process.versions.node.split('.')[0]);
if (major < 22) {
	die(`Node ${process.versions.node} é antigo demais.`, 'O Rubik precisa de Node 22 ou superior.');
}
ok(`Node ${process.versions.node}`);

if (!has('pnpm')) {
	die('pnpm não encontrado.', 'Instale com: npm install -g pnpm');
}
ok('pnpm');

if (!has('docker')) {
	die('Docker não encontrado.', 'Instale o Docker Desktop: https://docker.com/products/docker-desktop');
}

try {
	execSync('docker info', { stdio: 'ignore' });
	ok('Docker rodando');
} catch {
	die('Docker está instalado mas não está rodando.', 'Abra o Docker Desktop e rode `pnpm setup` de novo.');
}

// ---- 2. Arquivos de ambiente ------------------------------------------------

step('Preparando os arquivos de ambiente');

/**
 * Segredo aleatório de verdade em cada clone. O `.env.example` traz um
 * placeholder justamente para não virar o segredo real de ninguém.
 */
function fillSecrets(content) {
	return content
		.replace(/^BETTER_AUTH_SECRET=.*$/m, `BETTER_AUTH_SECRET=${randomBytes(32).toString('hex')}`)
		.replace(/^INTEGRATION_API_KEY=.*$/m, `INTEGRATION_API_KEY=${randomBytes(32).toString('hex')}`);
}

for (const app of ['', 'server', 'client']) {
	const target = join(root, app, '.env');
	const example = join(root, app, '.env.example');
	const label = app || 'raiz';

	if (existsSync(target)) {
		skip(`.env da ${label} já existe — mantido como está`);
		continue;
	}

	// Raiz e server guardam segredo; o do client é só `VITE_API_URL` vazio.
	if (app === 'client') {
		copyFileSync(example, target);
		ok('client/.env criado');
		continue;
	}

	writeFileSync(target, fillSecrets(readFileSync(example, 'utf8')));
	ok(`.env da ${label} criado, com segredos aleatórios`);
}

// ---- 3. Dependências --------------------------------------------------------

step('Instalando dependências');
run('pnpm', ['install']);
ok('dependências instaladas');

// ---- 4. Banco ---------------------------------------------------------------

/** Lê a porta do `.env` da raiz — o mesmo arquivo que o compose lê. */
function port(name, fallback) {
	const envFile = join(root, '.env');
	if (!existsSync(envFile)) {
		return fallback;
	}
	const match = new RegExp(`^${name}=(\\d+)$`, 'm').exec(readFileSync(envFile, 'utf8'));
	return match ? Number(match[1]) : fallback;
}

const postgresPort = port('POSTGRES_PORT', 5432);
const serverPort = port('SERVER_PORT', 3000);
const clientPort = port('CLIENT_PORT', 3001);

step('Subindo o Postgres');
run('docker', ['compose', 'up', '-d', '--wait', 'postgres']);
ok(`Postgres pronto em localhost:${postgresPort}`);

step('Aplicando as migrations');
run('pnpm', ['--filter', 'server', 'db:migrate']);
ok('schema aplicado');

// ---- 5. Admin inicial -------------------------------------------------------

step('Criando o admin inicial');
run('pnpm', ['--filter', 'server', 'db:seed']);

// ---- Pronto -----------------------------------------------------------------

console.log(`
${GREEN}${BOLD}Rubik pronto.${RESET}

  ${BOLD}pnpm dev:local${RESET}    server e client no host, só o banco em container

  Aplicação   ${BOLD}http://localhost:${clientPort}${RESET}
  API         ${BOLD}http://localhost:${serverPort}${RESET}

  Entre com  ${BOLD}desenvolvedor@letsup.team${RESET} / ${BOLD}123mudar${RESET}
`);

warn('Troque a senha do admin no primeiro login.');
