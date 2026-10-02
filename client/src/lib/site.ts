// Canonical site origin, resolved at runtime so copied links always match the environment: explicit env override first, then the page origin.
export function siteUrl(): string {
	const override = import.meta.env.VITE_SITE_URL;
	if (typeof override === 'string' && override.trim()) return override.trim().replace(/\/+$/, '');
	if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
	return 'https://crowbit.dev';
}

export const profileLink = (id: string): string => `${siteUrl()}/u/${id}`;

export const postLink = (slug: string): string => `${siteUrl()}/p/${slug}`;

export const messageLink = (id: string): string => `${siteUrl()}/m/${id}`;

export const commentLink = (postTitle: string, index: number): string => `${siteUrl()}/c/${postTitle}/${index}`;
