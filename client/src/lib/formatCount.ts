export function formatCount(value: number): string {
	if (value < 1000) return `${value}`;
	if (value < 1_000_000) return `${trimZeros(value / 1000)}k`;
	return `${trimZeros(value / 1_000_000)}m`;
}

function trimZeros(value: number): string {
	return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
