import type { NotificationKind } from '../types';

export const notifFilterLabels: Record<'all' | NotificationKind, string> = {
	all: 'All activity',
	mention: 'Mentions',
	like: 'Likes',
	follow_request: 'Follow requests',
	reply: 'Replies',
	comment: 'Comments',
};
