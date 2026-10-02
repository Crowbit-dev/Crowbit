import type { NotificationKind } from '../types';

export const notifFilterLabels: Record<'all' | NotificationKind, string> = {
	all: 'All activity',
	mention: 'Mentions',
	like: 'Likes',
	friend_request: 'Friend requests',
	reply: 'Replies',
	comment: 'Comments',
};
