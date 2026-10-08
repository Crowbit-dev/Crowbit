// Single call site for backend requests: prefixes VITE_API_URL (blank in dev, so the Vite proxy handles /api) and always sends cookies.
export function apiUrl(path: string): string {
	const base = import.meta.env.VITE_API_URL;
	const prefix = typeof base === 'string' ? base.trim().replace(/\/+$/, '') : '';
	return `${prefix}${path}`;
}

// TEMPORARY: thin fetch wrapper until auth flows need retries and typed errors.
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
	return fetch(apiUrl(path), { credentials: 'include', ...init });
}
