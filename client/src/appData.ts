// LOCAL-ONLY: fabricated values until a backend exists. Domain shapes live in types.ts — delete this file when real data arrives.
import crowPhotograph from './assets/crowphotograph.png';
import crowSideProfile from './assets/crowsideprofile.png';
import type {
	Community,
	CommunityChannel,
	DirectMessage,
	MessageEntry,
	NotificationItem,
	Post,
	ThreadComment,
} from './types';

export const communities: Community[] = [
	{
		id: '110000000000000001',
		name: 'Design',
		color: '#dc143c',
		joined: true,
		bio: 'Critique, process, and polish for people who make interfaces.',
		channels: [
			{ id: '120000000000000001', name: 'general', topic: 'Share work, critique, and weekly goals', unread: 6 },
			{ id: '120000000000000002', name: 'feedback', topic: 'Design reviews, prototypes, and polish', unread: 2 },
			{ id: '120000000000000003', name: 'showcase', topic: 'Post releases, experiments, and wins' },
			{ id: '120000000000000004', name: 'stuff', topic: 'stuff' },
		],
		members: [
			{
				id: '100000000000000005',
				name: 'Nyra',
				status: 'online',
				role: 'Lead designer',
				preview: 'Reviewing the new landing grid',
			},
			{
				id: '100000000000000006',
				name: 'Jun',
				status: 'away',
				role: 'Motion designer',
				preview: 'Recording motion notes for the team',
			},
			{
				id: '100000000000000007',
				name: 'Ari',
				status: 'offline',
				role: 'Product designer',
				preview: 'Left a comment on the prototype',
			},
		],
	},
	{
		id: '110000000000000002',
		name: 'Dev',
		color: '#2563eb',
		joined: true,
		bio: 'APIs, tooling, and shipping for people who build the stack.',
		channels: [
			{ id: '120000000000000005', name: 'backend', topic: 'APIs, auth, and service architecture', unread: 4 },
			{ id: '120000000000000006', name: 'frontend', topic: 'UI work, state, and client bugs' },
			{ id: '120000000000000007', name: 'ship-room', topic: 'Release checklists and deploy updates', unread: 1 },
		],
		members: [
			{
				id: '100000000000000008',
				name: 'Milo',
				status: 'online',
				role: 'Full-stack',
				preview: 'Comparing auth strategies',
			},
			{
				id: '100000000000000009',
				name: 'Tess',
				status: 'online',
				role: 'Platform',
				preview: 'Watching the deploy pipeline',
			},
			{ id: '100000000000000010', name: 'Rowan', status: 'away', role: 'Backend', preview: 'Tuning the API cache' },
		],
	},
	{
		id: '110000000000000003',
		name: 'Startup',
		color: '#515151',
		joined: true,
		bio: 'Launch notes, operator advice, and growth experiments for founders.',
		channels: [
			{ id: '120000000000000008', name: 'launch', topic: 'Announcements, launches, and milestones', unread: 3 },
			{ id: '120000000000000009', name: 'founders', topic: 'Operator advice and team decisions' },
			{ id: '120000000000000010', name: 'metrics', topic: 'Growth, retention, and experiments' },
		],
		members: [
			{
				id: '100000000000000011',
				name: 'Ava',
				status: 'online',
				role: 'Founder',
				preview: 'Collecting launch feedback',
			},
			{
				id: '100000000000000004',
				name: 'Theo',
				status: 'offline',
				role: 'Growth',
				preview: 'Shared a retention snapshot',
			},
			{
				id: '100000000000000013',
				name: 'Nia',
				status: 'away',
				role: 'Operations',
				preview: 'Reviewing onboarding copy',
			},
		],
	},
	{
		id: '110000000000000004',
		name: 'Tech',
		color: '#313131',
		joined: false,
		bio: 'Reliability, security, and infrastructure notes for small teams.',
		channels: [
			{ id: '120000000000000011', name: 'stack', topic: 'Tools, frameworks, and architecture' },
			{ id: '120000000000000012', name: 'ops', topic: 'Reliability, uptime, and incident notes', unread: 2 },
			{ id: '120000000000000013', name: 'security', topic: 'Privacy, access, and risk reviews' },
		],
		members: [
			{
				id: '100000000000000014',
				name: 'Noor',
				status: 'online',
				role: 'Security',
				preview: 'Audit checklist is ready',
			},
			{ id: '100000000000000015', name: 'Ivy', status: 'away', role: 'SRE', preview: 'Investigating latency spikes' },
			{
				id: '100000000000000016',
				name: 'Zed',
				status: 'offline',
				role: 'Infra',
				preview: 'Updated the deployment notes',
			},
		],
	},
	{
		id: '110000000000000005',
		name: 'Art',
		color: '#533e52',
		joined: false,
		bio: 'Sketches, finished pieces, and references for working artists.',
		channels: [
			{ id: '120000000000000014', name: 'sketches', topic: 'Process shots, drafts, and concepts', unread: 1 },
			{ id: '120000000000000015', name: 'releases', topic: 'Finished pieces and launches' },
			{ id: '120000000000000016', name: 'inspiration', topic: 'Moodboards, references, and saves' },
		],
		members: [
			{
				id: '100000000000000017',
				name: 'Mira',
				status: 'online',
				role: 'Illustrator',
				preview: 'Posting a fresh palette study',
			},
			{
				id: '100000000000000018',
				name: 'Kai',
				status: 'away',
				role: '3D artist',
				preview: 'Shared a render from the night shift',
			},
			{
				id: '100000000000000019',
				name: 'Sage',
				status: 'offline',
				role: 'Art director',
				preview: 'Queued a feedback pass',
			},
		],
	},
];

export const posts: Post[] = [
	{
		author: 'Nyra',
		handle: '@nyra',
		time: '2h ago',
		community: '110000000000000001',
		title: 'How are you building your personal brand in 2026?',
		body: 'I am trying to keep my portfolio, content, and design process aligned without burning out. Curious what other creators are doing.',
		image: crowPhotograph,
		audience: 'everyone',
		stats: { comments: 182, upvotes: 2400, shares: 42 },
	},
	{
		author: 'Milo',
		handle: '@milo',
		time: '5h ago',
		community: '110000000000000002',
		title: 'What is everyone using for fast internal tooling right now?',
		body: 'I am comparing auth, dashboards, and deployment speed. I want something practical, not just shiny demos.',
		image: crowSideProfile,
		audience: 'everyone',
		stats: { comments: 96, upvotes: 1800, shares: 21 },
	},
	{
		author: 'Ava',
		handle: '@ava',
		time: '1d ago',
		community: '110000000000000003',
		title: 'Founders: what do your best community rituals look like?',
		body: 'The most sustainable communities usually feel less like a launch and more like a habit. I am collecting examples.',
		audience: 'closeFriends',
		stats: { comments: 243, upvotes: 3100, shares: 58 },
	},
	{
		author: 'Noor',
		handle: '@noor',
		time: '3h ago',
		community: '110000000000000004',
		title: 'What is on your security audit checklist this quarter?',
		body: 'I am putting together a lightweight checklist for small teams: access reviews, dependency updates, and backup drills. What am I missing?',
		audience: 'everyone',
		stats: { comments: 64, upvotes: 1200, shares: 15 },
	},
];

export const directMessages: DirectMessage[] = [
	{
		id: '100000000000000001',
		name: 'Maya',
		username: '@maya',
		status: 'online',
		customStatus: '🚀 shipping the launch deck',
		preview: 'The deck is ready for review',
		time: 'now',
	},
	{
		id: '100000000000000002',
		name: 'Jules',
		username: '@jules',
		status: 'away',
		customStatus: '🎨 deep in mockups, brb',
		preview: 'I sent over the mockups',
		time: '12m',
	},
	{
		id: '100000000000000003',
		name: 'Sami',
		username: '@sami',
		status: 'online',
		customStatus: 'probably breaking prod',
		preview: 'We should ship the beta this week',
		time: '1h',
	},
	{
		id: '100000000000000004',
		name: 'Theo',
		username: '@theo',
		status: 'offline',
		customStatus: '✍️ drafting the next post',
		preview: 'Thanks for the feedback on the post',
		time: '3h',
	},
];

export const notifications: NotificationItem[] = [
	{
		id: 'n1',
		kind: 'mention',
		actor: 'Nyra',
		community: '110000000000000001',
		channel: 'general',
		snippet: 'Can you look at the landing grid when you get a sec?',
		time: '12m',
	},
	{
		id: 'n2',
		kind: 'like',
		actor: 'Jun',
		community: '110000000000000001',
		channel: 'showcase',
		snippet: 'How are you building your personal brand in 2026?',
		time: '26m',
		postTitle: 'How are you building your personal brand in 2026?',
	},
	{
		id: 'n3',
		kind: 'reply',
		actor: 'Jun',
		community: '110000000000000001',
		channel: 'feedback',
		snippet: 'Good call on the spacing — pushed a revision.',
		time: '44m',
	},
	{
		id: 'n4',
		kind: 'friend_request',
		actor: 'Kai',
		community: '110000000000000005',
		channel: 'sketches',
		snippet: 'sent you a friend request',
		time: '58m',
	},
	{
		id: 'n5',
		kind: 'mention',
		actor: 'Tess',
		community: '110000000000000002',
		channel: 'backend',
		snippet: 'The auth thread needs your eyes before we merge.',
		time: '1h',
	},
	{
		id: 'n6',
		kind: 'comment',
		actor: 'Milo',
		community: '110000000000000002',
		channel: 'backend',
		snippet: 'This matches what we saw on the dashboard work.',
		time: '2h',
		postTitle: 'What is everyone using for fast internal tooling right now?',
	},
	{
		id: 'n7',
		kind: 'reply',
		actor: 'Rowan',
		community: '110000000000000002',
		channel: 'ship-room',
		snippet: 'Cache tuning worked. Deploys are green again.',
		time: '2h',
	},
	{
		id: 'n8',
		kind: 'like',
		actor: 'Ava',
		community: '110000000000000003',
		channel: 'launch',
		snippet: 'Founders: what do your best community rituals look like?',
		time: '3h',
		postTitle: 'Founders: what do your best community rituals look like?',
	},
	{
		id: 'n9',
		kind: 'mention',
		actor: 'Ava',
		community: '110000000000000003',
		channel: 'launch',
		snippet: 'Quoting you in the launch notes — okay?',
		time: '3h',
	},
	{
		id: 'n10',
		kind: 'friend_request',
		actor: 'Sage',
		community: '110000000000000005',
		channel: 'inspiration',
		snippet: 'sent you a friend request',
		time: '4h',
	},
	{
		id: 'n11',
		kind: 'reply',
		actor: 'Noor',
		community: '110000000000000004',
		channel: 'ops',
		snippet: 'Added secret rotation to the checklist.',
		time: '5h',
	},
	{
		id: 'n12',
		kind: 'mention',
		actor: 'Mira',
		community: '110000000000000005',
		channel: 'sketches',
		snippet: 'Saved your palette study to the moodboard.',
		time: '1d',
	},
];

export const currentUser = { displayName: 'Nova', username: '@nova', email: 'nova@crowbit.dev' };

export const mutualFriendsByDm: Record<string, string[]> = {
	'100000000000000001': ['Jules', 'Sami', 'Theo'],
	'100000000000000002': ['Maya', 'Sami'],
	'100000000000000003': ['Maya', 'Jules', 'Theo', 'Noor'],
	'100000000000000004': ['Maya'],
};

export const comments: Record<string, ThreadComment[]> = {
	'How are you building your personal brand in 2026?': [
		{
			id: 'c1',
			author: 'Jun',
			time: '1h ago',
			body: 'Batching content one weekend a month saved me. The rest runs on a queue.',
		},
		{
			id: 'c2',
			author: 'Nyra',
			time: '44m ago',
			body: 'That is exactly the system I keep avoiding. What do you use for scheduling?',
		},
		{
			id: 'c3',
			author: 'Mira',
			time: '12m ago',
			body: 'Portfolio first, content second. Everything else is just distribution.',
		},
	],
	'What is everyone using for fast internal tooling right now?': [
		{
			id: 'c4',
			author: 'Tess',
			time: '4h ago',
			body: 'We moved dashboards onto the same auth as production. One login to rule them all.',
		},
		{ id: 'c5', author: 'Rowan', time: '2h ago', body: 'Seconded. The fastest tool is the one you stop maintaining.' },
	],
	'Founders: what do your best community rituals look like?': [
		{
			id: 'c6',
			author: 'Theo',
			time: '20h ago',
			body: 'Weekly demo thread. Same time, same channel, no exceptions for a year.',
		},
		{
			id: 'c7',
			author: 'Nia',
			time: '18h ago',
			body: 'Monthly AMA with a member instead of a guest. Way better attendance.',
		},
		{
			id: 'c8',
			author: 'Ava',
			time: '9h ago',
			body: 'Both of these are going straight into the notes. Keep them coming.',
		},
	],
	'What is on your security audit checklist this quarter?': [
		{
			id: 'c9',
			author: 'Ivy',
			time: '2h ago',
			body: 'Add secret rotation to that list. Everyone forgets it until the incident.',
		},
		{
			id: 'c10',
			author: 'Zed',
			time: '1h ago',
			body: 'Dependency pinning plus a weekly audit job. Boring and effective.',
		},
	],
};

export function buildChannelThread(channel: CommunityChannel, communityId: string, authors: string[]): MessageEntry[] {
	const [first = 'Ari', second = 'Jun'] = authors;
	const base = `${communityId}-${channel.id}`;
	return [
		{
			id: `${base}-1`,
			author: first,
			time: 'Yesterday',
			body: `Kicking off #${channel.name} — ${channel.topic.charAt(0).toLowerCase()}${channel.topic.slice(1)}`,
		},
		{
			id: `${base}-2`,
			author: second,
			time: 'Yesterday',
			body: 'Good timing, I was just looking at this. I will post my notes once they are cleaned up.',
		},
		{
			id: `${base}-3`,
			author: 'You',
			time: 'Yesterday',
			body: 'Same here — where should we keep the running decisions so they do not get buried?',
		},
		{
			id: `${base}-4`,
			author: first,
			time: 'Today',
			body: 'Pinned thread at the top works for now. I will summarize every Friday.',
			replyTo: {
				id: `${base}-3`,
				author: 'You',
				body: 'Same here — where should we keep the running decisions so they do not get buried?',
			},
		},
		{
			id: `${base}-5`,
			author: second,
			time: 'Today',
			body: 'Sounds good. I will send the revised version before the next check-in.',
		},
	];
}

export function buildDmThread(id: string, name: string, preview: string): MessageEntry[] {
	return [
		{ id: `${id}-1`, author: name, time: 'Yesterday', body: preview },
		{
			id: `${id}-2`,
			author: 'You',
			time: 'Yesterday',
			body: 'I left feedback on the latest update and marked the next steps.',
		},
		{ id: `${id}-3`, author: name, time: 'Today', body: 'I will send the revised version before the next check-in.' },
	];
}
