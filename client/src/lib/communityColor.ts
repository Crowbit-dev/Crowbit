// Returns the community color for gradient washes, falling back to the brand accent when the color is near-gray (its wash would read as mud on gray).
export function gradientCommunityColor(color: string): string {
	const match = /^#([0-9a-f]{6})$/i.exec(color.trim());
	if (!match) return 'var(--accent)';
	const r = parseInt(match[1].slice(0, 2), 16) / 255;
	const g = parseInt(match[1].slice(2, 4), 16) / 255;
	const b = parseInt(match[1].slice(4, 6), 16) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	if (max === min) return 'var(--accent)';
	const lightness = (max + min) / 2;
	const saturation = (max - min) / (1 - Math.abs(2 * lightness - 1));
	return saturation < 0.08 ? 'var(--accent)' : color;
}
