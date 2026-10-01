// LOCAL-ONLY: fabricated values until a backend exists. Domain shapes live in types.ts — delete this file when real data arrives.
import crowPhotograph from './assets/crowphotograph.png'
import crowSideProfile from './assets/crowsideprofile.png'
import type { Community, CommunityChannel, DirectMessage, MessageEntry, NotificationItem, Post, ThreadComment } from './types'

export const communities: Community[] = [
  {
    name: 'Design',
    color: '#dc143c',
    joined: true,
    channels: [
      { id: 'general', name: 'general', topic: 'Share work, critique, and weekly goals', unread: 6 },
      { id: 'feedback', name: 'feedback', topic: 'Design reviews, prototypes, and polish', unread: 2 },
      { id: 'showcase', name: 'showcase', topic: 'Post releases, experiments, and wins' },
      { id: 'stuff', name: 'stuff', topic: 'stuff' },
    ],
    members: [
      { name: 'Nyra', status: 'online', role: 'Lead designer', preview: 'Reviewing the new landing grid' },
      { name: 'Jun', status: 'away', role: 'Motion designer', preview: 'Recording motion notes for the team' },
      { name: 'Ari', status: 'offline', role: 'Product designer', preview: 'Left a comment on the prototype' },
    ],
  },
  {
    name: 'Dev',
    color: '#2563eb',
    joined: true,
    channels: [
      { id: 'backend', name: 'backend', topic: 'APIs, auth, and service architecture', unread: 4 },
      { id: 'frontend', name: 'frontend', topic: 'UI work, state, and client bugs' },
      { id: 'ship-room', name: 'ship-room', topic: 'Release checklists and deploy updates', unread: 1 },
    ],
    members: [
      { name: 'Milo', status: 'online', role: 'Full-stack', preview: 'Comparing auth strategies' },
      { name: 'Tess', status: 'online', role: 'Platform', preview: 'Watching the deploy pipeline' },
      { name: 'Rowan', status: 'away', role: 'Backend', preview: 'Tuning the API cache' },
    ],
  },
  {
    name: 'Startup',
    color: '#515151',
    joined: true,
    channels: [
      { id: 'launch', name: 'launch', topic: 'Announcements, launches, and milestones', unread: 3 },
      { id: 'founders', name: 'founders', topic: 'Operator advice and team decisions' },
      { id: 'metrics', name: 'metrics', topic: 'Growth, retention, and experiments' },
    ],
    members: [
      { name: 'Ava', status: 'online', role: 'Founder', preview: 'Collecting launch feedback' },
      { name: 'Theo', status: 'offline', role: 'Growth', preview: 'Shared a retention snapshot' },
      { name: 'Nia', status: 'away', role: 'Operations', preview: 'Reviewing onboarding copy' },
    ],
  },
  {
    name: 'Tech',
    color: '#313131',
    joined: false,
    channels: [
      { id: 'stack', name: 'stack', topic: 'Tools, frameworks, and architecture' },
      { id: 'ops', name: 'ops', topic: 'Reliability, uptime, and incident notes', unread: 2 },
      { id: 'security', name: 'security', topic: 'Privacy, access, and risk reviews' },
    ],
    members: [
      { name: 'Noor', status: 'online', role: 'Security', preview: 'Audit checklist is ready' },
      { name: 'Ivy', status: 'away', role: 'SRE', preview: 'Investigating latency spikes' },
      { name: 'Zed', status: 'offline', role: 'Infra', preview: 'Updated the deployment notes' },
    ],
  },
  {
    name: 'Art',
    color: '#533e52',
    joined: false,
    channels: [
      { id: 'sketches', name: 'sketches', topic: 'Process shots, drafts, and concepts', unread: 1 },
      { id: 'releases', name: 'releases', topic: 'Finished pieces and launches' },
      { id: 'inspiration', name: 'inspiration', topic: 'Moodboards, references, and saves' },
    ],
    members: [
      { name: 'Mira', status: 'online', role: 'Illustrator', preview: 'Posting a fresh palette study' },
      { name: 'Kai', status: 'away', role: '3D artist', preview: 'Shared a render from the night shift' },
      { name: 'Sage', status: 'offline', role: 'Art director', preview: 'Queued a feedback pass' },
    ],
  },
]

export const posts: Post[] = [
  {
    author: 'Nyra',
    handle: '@nyra',
    time: '2h ago',
    community: 'Design',
    title: 'How are you building your personal brand in 2026?',
    body:
      'I am trying to keep my portfolio, content, and design process aligned without burning out. Curious what other creators are doing.',
    image: crowPhotograph,
    stats: { comments: 182, upvotes: 2400, shares: 42 },
  },
  {
    author: 'Milo',
    handle: '@milo',
    time: '5h ago',
    community: 'Dev',
    title: 'What is everyone using for fast internal tooling right now?',
    body:
      'I am comparing auth, dashboards, and deployment speed. I want something practical, not just shiny demos.',
    image: crowSideProfile,
    stats: { comments: 96, upvotes: 1800, shares: 21 },
  },
  {
    author: 'Ava',
    handle: '@ava',
    time: '1d ago',
    community: 'Startup',
    title: 'Founders: what do your best community rituals look like?',
    body:
      'The most sustainable communities usually feel less like a launch and more like a habit. I am collecting examples.',
    stats: { comments: 243, upvotes: 3100, shares: 58 },
  },
  {
    author: 'Noor',
    handle: '@noor',
    time: '3h ago',
    community: 'Tech',
    title: 'What is on your security audit checklist this quarter?',
    body:
      'I am putting together a lightweight checklist for small teams: access reviews, dependency updates, and backup drills. What am I missing?',
    stats: { comments: 64, upvotes: 1200, shares: 15 },
  },
]

export const directMessages: DirectMessage[] = [
  { id: 'maya', name: 'Maya', status: 'online', customStatus: '🚀 shipping the launch deck', preview: 'The deck is ready for review', time: 'now' },
  { id: 'jules', name: 'Jules', status: 'away', customStatus: '🎨 deep in mockups, brb', preview: 'I sent over the mockups', time: '12m' },
  { id: 'sami', name: 'Sami', status: 'online', customStatus: 'probably breaking prod', preview: 'We should ship the beta this week', time: '1h' },
  { id: 'theo', name: 'Theo', status: 'offline', customStatus: '✍️ drafting the next post', preview: 'Thanks for the feedback on the post', time: '3h' },
]

export const notifications: NotificationItem[] = [
  { id: 'n1', kind: 'mention', actor: 'Nyra', community: 'Design', channel: 'general', snippet: 'Can you look at the landing grid when you get a sec?', time: '12m' },
  { id: 'n2', kind: 'like', actor: 'Jun', community: 'Design', channel: 'showcase', snippet: 'How are you building your personal brand in 2026?', time: '26m', postTitle: 'How are you building your personal brand in 2026?' },
  { id: 'n3', kind: 'reply', actor: 'Jun', community: 'Design', channel: 'feedback', snippet: 'Good call on the spacing — pushed a revision.', time: '44m' },
  { id: 'n4', kind: 'follow_request', actor: 'Kai', community: 'Art', channel: 'sketches', snippet: 'wants to follow you', time: '58m' },
  { id: 'n5', kind: 'mention', actor: 'Tess', community: 'Dev', channel: 'backend', snippet: 'The auth thread needs your eyes before we merge.', time: '1h' },
  { id: 'n6', kind: 'comment', actor: 'Milo', community: 'Dev', channel: 'backend', snippet: 'This matches what we saw on the dashboard work.', time: '2h', postTitle: 'What is everyone using for fast internal tooling right now?' },
  { id: 'n7', kind: 'reply', actor: 'Rowan', community: 'Dev', channel: 'ship-room', snippet: 'Cache tuning worked. Deploys are green again.', time: '2h' },
  { id: 'n8', kind: 'like', actor: 'Ava', community: 'Startup', channel: 'launch', snippet: 'Founders: what do your best community rituals look like?', time: '3h', postTitle: 'Founders: what do your best community rituals look like?' },
  { id: 'n9', kind: 'mention', actor: 'Ava', community: 'Startup', channel: 'launch', snippet: 'Quoting you in the launch notes — okay?', time: '3h' },
  { id: 'n10', kind: 'follow_request', actor: 'Sage', community: 'Art', channel: 'inspiration', snippet: 'wants to follow you', time: '4h' },
  { id: 'n11', kind: 'reply', actor: 'Noor', community: 'Tech', channel: 'ops', snippet: 'Added secret rotation to the checklist.', time: '5h' },
  { id: 'n12', kind: 'mention', actor: 'Mira', community: 'Art', channel: 'sketches', snippet: 'Saved your palette study to the moodboard.', time: '1d' },
]

export const mockCurrentUser = { displayName: 'Nova', username: '@nova' }

export const mutualFriendsByDm: Record<string, string[]> = {
  maya: ['Jules', 'Sami', 'Theo'],
  jules: ['Maya', 'Sami'],
  sami: ['Maya', 'Jules', 'Theo', 'Noor'],
  theo: ['Maya'],
}

export const mockComments: Record<string, ThreadComment[]> = {
  'How are you building your personal brand in 2026?': [
    { author: 'Jun', time: '1h ago', body: 'Batching content one weekend a month saved me. The rest runs on a queue.' },
    { author: 'Nyra', time: '44m ago', body: 'That is exactly the system I keep avoiding. What do you use for scheduling?' },
    { author: 'Mira', time: '12m ago', body: 'Portfolio first, content second. Everything else is just distribution.' },
  ],
  'What is everyone using for fast internal tooling right now?': [
    { author: 'Tess', time: '4h ago', body: 'We moved dashboards onto the same auth as production. One login to rule them all.' },
    { author: 'Rowan', time: '2h ago', body: 'Seconded. The fastest tool is the one you stop maintaining.' },
  ],
  'Founders: what do your best community rituals look like?': [
    { author: 'Theo', time: '20h ago', body: 'Weekly demo thread. Same time, same channel, no exceptions for a year.' },
    { author: 'Nia', time: '18h ago', body: 'Monthly AMA with a member instead of a guest. Way better attendance.' },
    { author: 'Ava', time: '9h ago', body: 'Both of these are going straight into the notes. Keep them coming.' },
  ],
  'What is on your security audit checklist this quarter?': [
    { author: 'Ivy', time: '2h ago', body: 'Add secret rotation to that list. Everyone forgets it until the incident.' },
    { author: 'Zed', time: '1h ago', body: 'Dependency pinning plus a weekly audit job. Boring and effective.' },
  ],
}

export function buildChannelThread(channel: CommunityChannel, communityName: string, authors: string[]): MessageEntry[] {
  const [first = 'Ari', second = 'Jun'] = authors
  const base = `${communityName}-${channel.id}`
  return [
    { id: `${base}-1`, author: first, time: 'Yesterday', body: `Kicking off #${channel.name} — ${channel.topic.charAt(0).toLowerCase()}${channel.topic.slice(1)}` },
    { id: `${base}-2`, author: second, time: 'Yesterday', body: 'Good timing, I was just looking at this. I will post my notes once they are cleaned up.' },
    { id: `${base}-3`, author: 'You', time: 'Yesterday', body: 'Same here — where should we keep the running decisions so they do not get buried?' },
    { id: `${base}-4`, author: first, time: 'Today', body: 'Pinned thread at the top works for now. I will summarize every Friday.', replyTo: { id: `${base}-3`, author: 'You', body: 'Same here — where should we keep the running decisions so they do not get buried?' } },
    { id: `${base}-5`, author: second, time: 'Today', body: 'Sounds good. I will send the revised version before the next check-in.' },
  ]
}

export function buildDmThread(id: string, name: string, preview: string): MessageEntry[] {
  return [
    { id: `${id}-1`, author: name, time: 'Yesterday', body: preview },
    { id: `${id}-2`, author: 'You', time: 'Yesterday', body: 'I left feedback on the latest update and marked the next steps.' },
    { id: `${id}-3`, author: name, time: 'Today', body: 'I will send the revised version before the next check-in.' },
  ]
}
