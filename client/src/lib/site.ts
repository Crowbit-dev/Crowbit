export function siteUrl(): string {
	const override = import.meta.env.VITE_SITE_URL;
	if (typeof override === 'string' && override.trim()) return override.trim().replace(/\/+$/, '');
	if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
	return 'https://crowbit.dev';
}

export const profileLink = (username: string): string => `${siteUrl()}/profile/${username.replace(/^@+/, '')}`;

export const postLink = (slug: string): string => `${siteUrl()}/p/${slug}`;

export const messageLink = (id: string): string => `${siteUrl()}/m/${id}`;

export const commentLink = (postId: string, index: number): string => `${siteUrl()}/c/${postId}/${index}`;
