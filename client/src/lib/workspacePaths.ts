export type WorkspaceRoute =	| { mode: 'feed' }
	| { mode: 'dms'; dmId?: string }
	| { mode: 'communities'; communityId: string; channelId?: string }
	| { mode: 'notifications' }
	| { mode: 'search' }
	| { mode: 'settings'; category?: string };

export const feedPath = () => '/home';

export const dmsPath = (dmId?: string) => (dmId ? `/home/dms/${dmId}` : '/home/dms');

export const communityPath = (communityId: string, channelId?: string) =>
	channelId ? `/home/c/${communityId}/${channelId}` : `/home/c/${communityId}`;

export const notificationsPath = () => '/home/notifications';

export const searchPath = () => '/home/search';

export const settingsPath = (category?: string) =>
	category && category !== 'account' ? `/home/settings/${category}` : '/home/settings';

function segments(pathname: string): string[] | null {
	const clean = pathname.split('?')[0].split('#')[0];
	if (!clean.startsWith('/home')) return null;
	const rest = clean.slice('/home'.length);
	if (rest === '' || rest === '/') return [];
	return rest
		.split('/')
		.filter(Boolean)
		.map((segment) => {
			try {
				return decodeURIComponent(segment);
			} catch {
				return segment;
			}
		});
}

export function parseWorkspacePath(pathname: string): WorkspaceRoute | null {
	const parts = segments(pathname);
	if (parts === null) return null;
	if (parts.length === 0) return { mode: 'feed' };
	const [head, ...tail] = parts;
	switch (head) {
		case 'dms':
			if (tail.length > 1) return null;
			return { mode: 'dms', dmId: tail[0] };
		case 'c':
			if (tail.length < 1 || tail.length > 2) return null;
			return { mode: 'communities', communityId: tail[0], channelId: tail[1] };
		case 'notifications':
			if (tail.length > 0) return null;
			return { mode: 'notifications' };
		case 'search':
			if (tail.length > 0) return null;
			return { mode: 'search' };
		case 'settings':
			if (tail.length > 1) return null;
			return { mode: 'settings', category: tail[0] };
		default:
			return null;
	}
}
