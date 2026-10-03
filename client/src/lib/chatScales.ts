export const CHAT_TEXT_SIZES = [12, 14, 15, 16, 18, 20, 24];
export const CHAT_TEXT_SIZE_DEFAULT = 15;
export const MESSAGE_SPACINGS = [0, 4, 8, 16, 20, 24];
export const MESSAGE_SPACING_DEFAULT = 20;
export const SATURATION_DEFAULT = 100;

export const snapCheckpoint = (stops: number[], value: unknown, fallback: number): number =>
	typeof value === 'number' && Number.isFinite(value)
		? stops.reduce((closest, stop) => (Math.abs(stop - value) < Math.abs(closest - value) ? stop : closest))
		: fallback;
