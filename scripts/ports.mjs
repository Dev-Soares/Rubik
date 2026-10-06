/**
 * `node scripts/ports.mjs` — escolhe as portas do host antes de subir o ambiente.
 *
 * Roda como `pre` de `dev`, `dev:local`, `db` e `docker:prod`. Numa máquina com
 * vários projetos as portas padrão (5432, 3000, 3001) estão quase sempre
 * ocupadas por outro container ou outro `node`, e o compose morre com `port is
 * already allocated` antes de subir qualquer coisa.
 *
 * Num clone novo não existe `.env` — este script cria. Para cada porta testa se
 * dá para escutar nela; ocupada, procura a próxima livre. O resultado vai para
 * o `.env` da RAIZ, de onde o compose lê (`${SERVER_PORT:-3000}`).
 *
 * Idempotente. Valor já no `.env` é respeitado e só se move se tiver virado
 * inválido (alguém ocupou a porta enquanto o ambiente estava desligado).
 */
import { createServer } from 'node:net';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const envPath = join(root, '.env');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

/** As portas que o host publica. A porta interna de cada serviço nunca muda. */
const PORTS = [
	{ name: 'POSTGRES_PORT', fallback: 5432, label: 'Postgres' },
	{ name: 'SERVER_PORT', fallback: 3000, label: 'API' },
	{ name: 'CLIENT_PORT', fallback: 3001, label: 'Aplicação' },
	{ name: 'STUDIO_PORT', fallback: 4983, label: 'Drizzle Studio' },
	{ name: 'CLIENT_PROD_PORT', fallback: 8080, label: 'Client (prod)' },
];

/**
 * Os quatro endereços são todos necessários, e `exclusive: true` também.
 *
 * Sem `exclusive` o Node binda com `SO_REUSEADDR` e consegue escutar numa porta
 * que já tem dono — falso-positivo justamente no caso que interessa. E bindar em
 * `::` NÃO colide com um dono em `[::1]`: os escopos diferem e o Windows libera,
 * mas `localhost` no browser resolve para o loopback, então a porta é inútil
 * para nós. O caso real que motivou a lista: um `vite` do host em `[::1]:3001`
 * passando como livre.
 */
const PROBE_HOSTS = ['0.0.0.0', '127.0.0.1', '::', '::1'];

function bindable(port, host) {
	return new Promise((resolve) => {
		const server = createServer();
		server.once('error', () => resolve(false));
		server.once('listening', () => server.close(() => resolve(true)));
		server.listen({ port, host, exclusive: true });
	});
}

async function isFree(port) {
	for (const host of PROBE_HOSTS) {
		if (!(await bindable(port, host))) {
			return false;
		}
	}
	return true;
}

async function findFree(start, taken) {
	// 200 tentativas: suficiente para qualquer máquina de dev, e evita laço
	// infinito se algo estiver bloqueando a faixa inteira.
	for (let port = start; port < start + 200; port += 1) {
		if (taken.has(port)) {
			continue;
		}
		if (await isFree(port)) {
			return port;
		}
	}
	throw new Error(`Nenhuma porta livre entre ${start} e ${start + 200}.`);
}

function parseEnv(content) {
	const entries = new Map();
	for (const line of content.split(/\r?\n/)) {
		const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
		if (match) {
			entries.set(match[1], match[2]);
		}
	}
	return entries;
}

/**
 * Reescreve só as chaves informadas e preserva o resto — o `.env` da raiz também
 * guarda segredo e config de integração que não é deste script.
 */
function writeEnv(content, values) {
	let output = content;
	for (const [key, value] of values) {
		const line = `${key}=${value}`;
		const pattern = new RegExp(`^${key}=.*$`, 'm');
		// Callback no `replace`: o valor pode conter `$` (em `DATABASE_URL`, por
		// exemplo) e a forma com string o leria como referência de grupo.
		output = pattern.test(output) ? output.replace(pattern, () => line) : `${output.replace(/\s*$/, '')}\n${line}\n`;
	}
	return output.replace(/^\n+/, '');
}

const content = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
const current = parseEnv(content);

const resolved = new Map();
const moved = [];

/**
 * Toda porta pretendida entra em `taken` ANTES do laço. Sem isso um serviço que
 * desvia pode pousar na porta padrão de um serviço ainda não processado — a API
 * saindo de 3000 ocupada cairia em 3001, o padrão do client, e os dois
 * trocariam de lugar a cada execução.
 */
const taken = new Set(PORTS.map(({ name, fallback }) => Number(current.get(name)) || fallback));

for (const { name, fallback, label } of PORTS) {
	const pinned = Number(current.get(name));
	const desired = Number.isInteger(pinned) && pinned > 0 ? pinned : fallback;

	if (await isFree(desired)) {
		resolved.set(name, desired);
		continue;
	}

	// A porta pretendida está fora de jogo: libera o lugar dela na reserva para
	// não bloquear a busca de outro serviço, e procura a próxima livre.
	taken.delete(desired);
	const free = await findFree(desired + 1, taken);
	taken.add(free);
	resolved.set(name, free);
	moved.push({ label, name, from: desired, to: free });
}

const changed = !existsSync(envPath) || [...resolved].some(([key, value]) => current.get(key) !== String(value));

if (changed) {
	writeFileSync(envPath, writeEnv(content, resolved));
}

/**
 * `dev:local` roda server e client no host, lendo `server/.env` e `client/.env`
 * — não o da raiz. Sem este passo, desviar a porta deixaria o caminho sem Docker
 * apontando para a porta velha: o server subiria onde o client não chama, e o
 * `DATABASE_URL` buscaria um Postgres que não está mais lá.
 *
 * Só reescreve `.env` que já existe (criado por `pnpm setup`), e só estas chaves.
 */
function syncAppEnv(file, values) {
	const target = join(root, file);
	if (!existsSync(target)) {
		return;
	}

	const before = readFileSync(target, 'utf8');
	const after = writeEnv(before, values);
	if (after !== before) {
		writeFileSync(target, after);
		console.log(`${DIM}  ${file} atualizado${RESET}`);
	}
}

const postgresPort = resolved.get('POSTGRES_PORT');
const serverPort = resolved.get('SERVER_PORT');
const clientPort = resolved.get('CLIENT_PORT');

syncAppEnv(
	'server/.env',
	new Map([
		['PORT', serverPort],
		['DATABASE_URL', `postgresql://postgres:postgres@localhost:${postgresPort}/rubikdb`],
		// A origem do CLIENT: o navegador chega à API pelo proxy do Vite, então é
		// essa a origem que ele usa — a porta do server ele nunca vê.
		['BETTER_AUTH_URL', `http://localhost:${clientPort}`],
		['CORS_ORIGIN', `http://localhost:${clientPort}`],
	]),
);

/**
 * Vazio, e não a URL da API: o client chama em caminho relativo e o proxy do
 * Vite encaminha (ver `client/vite.config.ts`). Apontar para a porta da API
 * aqui faria o navegador enxergar duas origens, e o cookie de sessão
 * (`sameSite: 'lax'` em dev) não viajaria nas chamadas XHR.
 */
syncAppEnv('client/.env', new Map([['VITE_API_URL', '']]));

if (moved.length === 0) {
	console.log(`${DIM}· portas padrão livres${RESET}`);
} else {
	for (const { label, name, from, to } of moved) {
		console.log(`${YELLOW}!${RESET} ${label}: ${from} ocupada → ${GREEN}${to}${RESET} ${DIM}(${name} no .env)${RESET}`);
	}
}

console.log(
	`${DIM}  Aplicação ${RESET}http://localhost:${clientPort}${DIM} · API ${RESET}http://localhost:${serverPort}`,
);
