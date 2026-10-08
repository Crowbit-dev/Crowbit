export type DelaunayPoint = { x: number; y: number };

// Bowyer-Watson Delaunay triangulation. Returns index triples into `points`. used for generating a triangulated mosaic
export function delaunay(points: DelaunayPoint[]): Array<[number, number, number]> {
	const minX = Math.min(...points.map((point) => point.x));
	const minY = Math.min(...points.map((point) => point.y));
	const maxX = Math.max(...points.map((point) => point.x));
	const maxY = Math.max(...points.map((point) => point.y));
	const dx = maxX - minX;
	const dy = maxY - minY;
	const margin = Math.max(dx, dy) * 10;
	const working: DelaunayPoint[] = [
		...points,
		{ x: minX - margin, y: minY - margin },
		{ x: minX + dx / 2, y: maxY + margin },
		{ x: maxX + margin, y: minY - margin },
	];
	const superStart = points.length;
	let triangles: Array<[number, number, number]> = [[superStart, superStart + 1, superStart + 2]];

	const circumContains = (a: number, b: number, c: number, p: number): boolean => {
		const ax = working[a].x - working[p].x;
		const ay = working[a].y - working[p].y;
		const bx = working[b].x - working[p].x;
		const by = working[b].y - working[p].y;
		const cx = working[c].x - working[p].x;
		const cy = working[c].y - working[p].y;
		const det =
			(ax * ax + ay * ay) * (bx * cy - cx * by) -
			(bx * bx + by * by) * (ax * cy - cx * ay) +
			(cx * cx + cy * cy) * (ax * by - bx * ay);
		const orient =
			(working[b].x - working[a].x) * (working[c].y - working[a].y) -
			(working[c].x - working[a].x) * (working[b].y - working[a].y);
		return orient >= 0 ? det > 0 : det < 0;
	};

	for (let pi = 0; pi < points.length; pi++) {
		const bad: Array<[number, number, number]> = [];
		const good: Array<[number, number, number]> = [];
		for (const triangle of triangles) {
			if (circumContains(triangle[0], triangle[1], triangle[2], pi)) bad.push(triangle);
			else good.push(triangle);
		}
		const edgeCounts = new Map<string, { count: number; edge: [number, number] }>();
		for (const [a, b, c] of bad) {
			for (const edge of [
				[a, b],
				[b, c],
				[c, a],
			] as Array<[number, number]>) {
				const key = edge[0] < edge[1] ? `${edge[0]}-${edge[1]}` : `${edge[1]}-${edge[0]}`;
				const entry = edgeCounts.get(key);
				if (entry) entry.count += 1;
				else edgeCounts.set(key, { count: 1, edge });
			}
		}
		const boundary: Array<[number, number]> = [];
		for (const { count, edge } of edgeCounts.values()) {
			if (count === 1) boundary.push(edge);
		}
		triangles = [...good, ...boundary.map((edge): [number, number, number] => [edge[0], edge[1], pi])];
	}

	return triangles.filter(([a, b, c]) => a < points.length && b < points.length && c < points.length);
}
