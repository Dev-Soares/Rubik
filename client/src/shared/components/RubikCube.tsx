import { cn } from 'cn';

/**
 * Cubo isométrico 3x3 em SVG, montando-se peça por peça.
 *
 * Cada face é ancorada num vértice diferente do cubo e usa dois eixos:
 * - topo: dois eixos diagonais (losango)
 * - laterais: um eixo diagonal + o eixo vertical (paralelogramo)
 *
 * Os tiles entram deslizando na direção da própria face, escalonados por
 * face e por posição, como se o cubo fosse montado. Respeita
 * `prefers-reduced-motion`.
 */

const TILE = 26;
const GAP = 2.5;
const STEP = TILE + GAP;
const EDGE = 3 * STEP;

const K = 0.866;
const DOWN_RIGHT = { x: K, y: 0.5 };
const DOWN_LEFT = { x: -K, y: 0.5 };
const UP_RIGHT = { x: K, y: -0.5 };
const DOWN = { x: 0, y: 1 };

type Axis = { x: number; y: number };
type Face = 'top' | 'left' | 'right';

const VERTEX_TOP = { x: 0, y: -EDGE };
const VERTEX_LEFT = {
	x: VERTEX_TOP.x + EDGE * DOWN_LEFT.x,
	y: VERTEX_TOP.y + EDGE * DOWN_LEFT.y,
};
const VERTEX_FRONT = {
	x: VERTEX_TOP.x + EDGE * DOWN_RIGHT.x + EDGE * DOWN_LEFT.x,
	y: VERTEX_TOP.y + EDGE * DOWN_RIGHT.y + EDGE * DOWN_LEFT.y,
};

const FACES: Record<Face, { origin: Axis; a: Axis; b: Axis }> = {
	top: { origin: VERTEX_TOP, a: DOWN_RIGHT, b: DOWN_LEFT },
	left: { origin: VERTEX_LEFT, a: DOWN_RIGHT, b: DOWN },
	right: { origin: VERTEX_FRONT, a: UP_RIGHT, b: DOWN },
};

/** Direção de onde cada face "cai": topo vem de cima, laterais de fora. */
const ENTRY: Record<Face, Axis> = {
	top: { x: 0, y: -46 },
	left: { x: -40, y: 23 },
	right: { x: 40, y: 23 },
};

function tilePoints(face: Face, col: number, row: number): string {
	const { origin, a, b } = FACES[face];
	const u = col * STEP;
	const v = row * STEP;

	const corner = (du: number, dv: number) => {
		const x = origin.x + (u + du) * a.x + (v + dv) * b.x;
		const y = origin.y + (u + du) * a.y + (v + dv) * b.y;
		return `${x.toFixed(2)},${y.toFixed(2)}`;
	};

	return [corner(0, 0), corner(TILE, 0), corner(TILE, TILE), corner(0, TILE)].join(' ');
}

const INDEXES = [0, 1, 2];

const FACE_FILL: Record<Face, string> = {
	top: 'fill-current/95',
	left: 'fill-current/50',
	right: 'fill-current/72',
};

/** Ordem de entrada das faces: topo, esquerda, direita. */
const FACE_ORDER: Record<Face, number> = { top: 0, left: 1, right: 2 };

const TILE_DELAY = 0.07;
const FACE_DELAY = 0.55;

function CubeFace({ face }: { face: Face }) {
	const entry = ENTRY[face];

	return (
		<g className={FACE_FILL[face]}>
			{INDEXES.map((row) =>
				INDEXES.map((col) => (
					<polygon
						key={`${row}-${col}`}
						points={tilePoints(face, col, row)}
						className="cube-tile"
						style={
							{
								'--from-x': `${entry.x}px`,
								'--from-y': `${entry.y}px`,
								animationDelay: `${(FACE_ORDER[face] * FACE_DELAY + (row + col) * TILE_DELAY).toFixed(2)}s`,
							} as React.CSSProperties
						}
					/>
				)),
			)}
		</g>
	);
}

type RubikCubeProps = {
	className?: string;
};

export function RubikCube({ className }: RubikCubeProps) {
	return (
		<svg
			/* Inclui o deslocamento de entrada dos tiles: com um viewBox justo ao
			   cubo, as peças aparecem cortadas na borda durante a animação. */
			viewBox="-120 -138 240 250"
			role="img"
			aria-label="Cubo Rubik"
			className={cn('text-current', className)}
		>
			<CubeFace face="top" />
			<CubeFace face="left" />
			<CubeFace face="right" />
		</svg>
	);
}
