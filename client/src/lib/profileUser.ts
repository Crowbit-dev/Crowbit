import type { Community, DirectMessage } from '../types';

export type ProfileUser = {
	name: string;
	username: string;
	isSelf: boolean;
};

export function findProfileUser(
	rawUsername: string,
	input: {
		communities: Community[];
		directMessages: DirectMessage[];
		selfName: string;
		selfUsername: string;
	},
): ProfileUser | null {
	const normalized = rawUsername.replace(/^@+/, '').trim().toLowerCase();
	if (!normalized) return null;
	if (normalized === 'you' || normalized === input.selfUsername.replace(/^@+/, '').trim().toLowerCase()) {
		return { name: input.selfName, username: input.selfUsername.replace(/^@+/, ''), isSelf: true };
	}
	for (const community of input.communities) {
		const member = community.members.find((entry) => entry.name.toLowerCase() === normalized);
		if (member) return { name: member.name, username: member.name.toLowerCase(), isSelf: false };
	}
	const dm = input.directMessages.find(
		(entry) =>
			entry.name.toLowerCase() === normalized || entry.username.replace(/^@+/, '').toLowerCase() === normalized,
	);
	if (dm) return { name: dm.name, username: dm.username.replace(/^@+/, ''), isSelf: false };
	return null;
}
