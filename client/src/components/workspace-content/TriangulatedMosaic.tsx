import { delaunay, type DelaunayPoint } from '../../lib/delaunay';

function hashSeed(value: string): number {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

export default function TriangulatedMosaic({ seed }: { seed: string }) {
	const width = 1080;
	const height = 128;
	const cols = 22;
	const rows = 8;
	const base = hashSeed(seed);
	const random = (n: number) => {
		const x = Math.sin(base + n * 0.61803398875) * 10000;
		return x - Math.floor(x);
	};
	const points: DelaunayPoint[] = [
		{ x: 0, y: 0 },
		{ x: width, y: 0 },
		{ x: 0, y: height },
		{ x: width, y: height },
	];
	for (let row = 0; row <= rows; row++) {
		for (let col = 0; col <= cols; col++) {
			if ((row === 0 || row === rows) && (col === 0 || col === cols)) continue;
			const edgeX = row === 0 || row === rows;
			const edgeY = col === 0 || col === cols;
			const jx = edgeX ? 0 : (random(row * 131 + col * 17 + 1) - 0.5) * (width / cols) * 0.9;
			const jy = edgeY ? 0 : (random(row * 131 + col * 17 + 2) - 0.5) * (height / rows) * 0.9;
			points.push({
				x: Math.min(width, Math.max(0, (col / cols) * width + jx)),
				y: Math.min(height, Math.max(0, (row / rows) * height + jy)),
			});
		}
	}
	const triangles = delaunay(points);
	return (
		<svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
			{triangles.map((triangle, index) => {
				const dark = random(index * 2 + 0.25) > 0.5;
				return (
					<polygon
						key={index}
						points={triangle.map((pointIndex) => `${points[pointIndex].x},${points[pointIndex].y}`).join(' ')}
						fill={dark ? '#000000' : '#ffffff'}
						opacity={Math.round(random(index * 2 + 0.75) * 22) / 100}
					/>
				);
			})}
		</svg>
	);
}
