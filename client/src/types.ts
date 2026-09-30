// Permanent domain shapes. These describe what the backend will return, so they live apart from the LOCAL-ONLY mock values in appData.ts.
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
