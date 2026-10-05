import type { Community, DirectMessage, Post, SearchUser } from '../types';

// Shared matchers so the sidebar counts and the result lists never diverge.
export function matchPosts(posts: Post[], query: string): Post[] {
	if (!query) return posts.slice(0, 2);
	return posts.filter((post) =>
		`${post.title} ${post.body} ${post.author} ${post.handle} ${post.community}`.toLowerCase().includes(query),
	);
}

export function matchCommunities(communities: Community[], query: string): Community[] {
	if (!query) return communities.slice(0, 2);
	return communities.filter((community) =>
		`${community.name} ${community.channels.map((channel) => `${channel.name} ${channel.topic}`).join(' ')} ${community.members.map((member) => `${member.name} ${member.role}`).join(' ')}`
			.toLowerCase()
			.includes(query),
	);
}

export function matchUsers(communities: Community[], directMessages: DirectMessage[], query: string): SearchUser[] {
	const seen = new Set<string>();
	const users: SearchUser[] = [];
	const consider = (user: SearchUser) => {
		const key = user.name.toLowerCase();
		if (seen.has(key)) return;
		if (query && !`${user.name} ${user.detail}`.toLowerCase().includes(query)) return;
		seen.add(key);
		users.push(user);
	};
	for (const dm of directMessages) {
		consider({
			name: dm.name,
			detail: dm.customStatus,
			status: dm.status,
			dmId: dm.id,
			community: communities.find((community) => community.members.some((member) => member.name === dm.name))?.id ?? '',
		});
	}
	for (const community of communities) {
		for (const member of community.members) {
			consider({ name: member.name, detail: member.role, status: member.status, community: community.id });
		}
	}
	return query ? users : users.slice(0, 2);
}
