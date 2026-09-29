import crowPhotograph from './assets/crowphotograph.png'
import crowSideProfile from './assets/crowsideprofile.png'

export type WorkspaceMode = 'feed' | 'dms' | 'communities' | 'notifications' | 'search' | 'settings'

export type CommunityChannel = {
  id: string
  name: string
  topic: string
  unread?: number
}

export type CommunityMember = {
  name: string
  status: 'online' | 'away' | 'offline'
  role: string
  preview: string
}

export type Community = {
  name: string
  color: string
  joined: boolean
  channels: CommunityChannel[]
  members: CommunityMember[]
}

export type DirectMessage = {
  id: string
  name: string
  status: 'online' | 'away' | 'offline'
  customStatus: string
  preview: string
  time: string
}

export type Post = {
  author: string
  handle: string
  time: string
  community: string
  title: string
  body: string
  image?: string
  stats: {
    comments: number
    upvotes: number
    shares: number
  }
}

export const communities: Community[] = [
  {
    name: 'Design',
    color: '#533e52',
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
    color: '#423341',
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
    stats: { comments: 182, upvotes: 2.4, shares: 42 },
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
    stats: { comments: 96, upvotes: 1.8, shares: 21 },
  },
  {
    author: 'Ava',
    handle: '@ava',
    time: '1d ago',
    community: 'Startup',
    title: 'Founders: what do your best community rituals look like?',
    body:
      'The most sustainable communities usually feel less like a launch and more like a habit. I am collecting examples.',
    stats: { comments: 243, upvotes: 3.1, shares: 58 },
  },
  {
    author: 'Noor',
    handle: '@noor',
    time: '3h ago',
    community: 'Tech',
    title: 'What is on your security audit checklist this quarter?',
    body:
      'I am putting together a lightweight checklist for small teams: access reviews, dependency updates, and backup drills. What am I missing?',
    stats: { comments: 64, upvotes: 1.2, shares: 15 },
  },
]

export const directMessages: DirectMessage[] = [
  { id: 'maya', name: 'Maya', status: 'online', customStatus: '🚀 shipping the launch deck', preview: 'The deck is ready for review', time: 'now' },
  { id: 'jules', name: 'Jules', status: 'away', customStatus: '🎨 deep in mockups, brb', preview: 'I sent over the mockups', time: '12m' },
  { id: 'sami', name: 'Sami', status: 'online', customStatus: 'probably breaking prod', preview: 'We should ship the beta this week', time: '1h' },
  { id: 'theo', name: 'Theo', status: 'offline', customStatus: '✍️ drafting the next post', preview: 'Thanks for the feedback on the post', time: '3h' },
]

export type NotificationKind = 'mention' | 'like' | 'follow_request' | 'reply' | 'comment'

export type NotificationItem = {
  id: string
  kind: NotificationKind
  actor: string
  community: string
  channel: string
  snippet: string
  time: string
  postTitle?: string
}

// LOCAL-ONLY: fabricated activity until a backend exists.
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
