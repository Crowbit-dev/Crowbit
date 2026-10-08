// LOCAL-ONLY: fabricated values until a backend exists. Domain shapes live in types.ts (delete this file when real data arrives)
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
		id: '130000000000000001',
		author: 'Nyra',
		handle: '@nyra',
		time: '2h ago',
		community: '110000000000000001',
		title: 'This is my beautiful crow design.',
		body: 'I lied about it being beautiful. It is a crow. I am not a designer. Sorry.',
		image: crowPhotograph,
		audience: 'everyone',
		stats: { comments: 182, upvotes: 2400, shares: 42 },
	},
	{
		id: '130000000000000002',
		author: 'Milo',
		handle: '@milo',
		time: '5h ago',
		community: '110000000000000002',
		title: 'How do I get my crow to stop force pushing?',
		body: 'My crow keeps force pushing to the main branch. I have tried everything. Please help.',
		image: crowSideProfile,
		audience: 'everyone',
		stats: { comments: 96, upvotes: 1800, shares: 21 },
	},
	{
		id: '130000000000000003',
		author: 'Ava',
		handle: '@ava',
		time: '1d ago',
		community: '110000000000000003',
		title: 'I caught corvid19, should I go into work?',
		body: '',
		audience: 'everyone',
		stats: { comments: 243, upvotes: 3100, shares: 58 },
	},
	{
		id: '130000000000000004',
		author: 'Noor',
		handle: '@noor',
		time: '3h ago',
		community: '110000000000000004',
		title: 'I made a security checklist for crows, please review.',
		body: '1. Make sure the crow has a strong password.\n2. Make sure the crow has two-factor authentication enabled.\n3. Make sure the crow is not using the same password for multiple accounts.\n4. Make sure the crow is not clicking on suspicious links.',
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
		customStatus: 'shipping the launch deck',
		preview: 'The deck is ready for review',
		time: 'now',
	},
	{
		id: '100000000000000002',
		name: 'Jules',
		username: '@jules',
		status: 'away',
		customStatus: 'deep in mockups, brb',
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
		customStatus: 'drafting the next post',
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
		snippet: 'This is my beautiful crow design.',
		time: '26m',
		postId: '130000000000000001',
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
		postId: '130000000000000004',
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
		snippet: 'How do I get my crow to stop force pushing?',
		time: '3h',
		postId: '130000000000000002',
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

export const currentUser = {
	displayName: 'Nova',
	username: '@nova',
	email: 'nova@crowbit.dev',
	bio: 'Designing little corners of the internet.',
};

export const mutualFriendsByDm: Record<string, string[]> = {
	'100000000000000001': ['Jules', 'Sami', 'Theo'],
	'100000000000000002': ['Maya', 'Sami'],
	'100000000000000003': ['Maya', 'Jules', 'Theo', 'Noor'],
	'100000000000000004': ['Maya'],
};

export const comments: Record<string, ThreadComment[]> = {
	'130000000000000001': [
		{
			id: 'c1',
			author: 'Jun',
			time: '1h ago',
			body: 'I hope you are not using the crow for production work. It is a very bad idea to use a crow for production work.',
		},
		{
			id: 'c2',
			author: 'Nyra',
			time: '44m ago',
			body: 'I am not using the crow for production work. I am using it for design work. It is a very good idea to use a crow for design work.',
			replyTo: { id: 'c1' },
		},
		{
			id: 'c3',
			author: 'Mira',
			time: '12m ago',
			body: 'Are you crazy? You are using a crow for design work? It is a very bad idea to use a crow for design work. Use a crow for production work, not design work.',
			replyTo: { id: 'c2' },
		},
		{
			id: 'c7',
			author: 'Kai',
			time: '6m ago',
			body: 'what kind of idiot uses a crow for design or production work? I use a crow for illegal weapons trafficking. It is a very good idea to use a crow for illegal weapons trafficking.',
			replyTo: { id: 'c3' },
		},
		{
			id: 'c8',
			author: 'Sage',
			time: '1m ago',
			body: "OP, I don't own a crow but when I saw your post I immediately cried. I am a very sensitive person and I cry easily. Please do not use a crow for design or production work or even illegal weapons trafficking. It is a very bad idea to use a crow for any of those things.",
		},
		{
			id: 'c9',
			author: 'House',
			time: '1m ago',
			body: "It's never lupus."
		},
		{
			id: 'c10',
			author: 'Wilson',
			time: '1m ago',
			body: "I too am in this episode.",
			replyTo: { id: 'c9' },
		},
	],
	'130000000000000002': [
		{
			id: 'c4',
			author: 'Tess',
			time: '4h ago',
			body: "Take away high-level access and give them a read-only keypair. That is the only way to stop force pushes. Also don't use RSA, they don't look like they understand the concept of keypairs, but they've cracked the RSA algorithm.",
		},
		{ id: 'c5', author: 'Rowan', time: '2h ago', body: "They CRACKED RSA ?? They're going to take our jobs..." },
	],
	'130000000000000003': [
		{
			id: 'c6',
			author: 'Theo',
			time: '20h ago',
			body: 'you are a caw-worker from hell',
		},
	],
	'130000000000000004': [
		{
			id: 'c9',
			author: 'Ivy',
			time: '2h ago',
			body: "They don't even understand the concept of RSA keypairs, silly birds. Everyone forgets that until the incident happens...",
		},
		{
			id: 'c10',
			author: 'Zed',
			time: '1h ago',
			body: 'Ban them from doing accounting too... learnt this the hard way.',
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
			replyTo: { id: `${base}-3` },
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
