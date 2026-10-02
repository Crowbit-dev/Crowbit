// Permanent domain shapes. These describe what the backend will return, so they live apart from the LOCAL-ONLY mock values in appData.ts.
export type WorkspaceMode = 'feed' | 'dms' | 'communities' | 'notifications' | 'search' | 'settings';

export type CommunityChannel = {
	id: string;
	name: string;
	topic: string;
	unread?: number;
};

export type CommunityMember = {
	name: string;
	status: 'online' | 'away' | 'offline';
	role: string;
	preview: string;
};

export type Community = {
	name: string;
	color: string;
	joined: boolean;
	bio: string;
	channels: CommunityChannel[];
	members: CommunityMember[];
};

export type DirectMessage = {
	id: string;
	name: string;
	status: 'online' | 'away' | 'offline';
	customStatus: string;
	preview: string;
	time: string;
};

export type PostAudience = 'everyone' | 'closeFriends';

export type Post = {
	author: string;
	handle: string;
	time: string;
	community: string;
	title: string;
	body: string;
	image?: string;
	audience: PostAudience;
	stats: {
		comments: number;
		upvotes: number;
		shares: number;
	};
};

export type NotificationKind = 'mention' | 'like' | 'friend_request' | 'reply' | 'comment';

export type NotificationItem = {
	id: string;
	kind: NotificationKind;
	actor: string;
	community: string;
	channel: string;
	snippet: string;
	time: string;
	postTitle?: string;
};

export type MessageEntry = {
	id: string;
	author: string;
	time: string;
	body: string;
	image?: string;
	edited?: boolean;
	replyTo?: { id: string; author: string; body: string };
};

export type ThreadComment = {
	id: string;
	author: string;
	time: string;
	body: string;
	edited?: boolean;
	replyTo?: { id: string; author: string; body: string };
};

export type ConversationMutuals = {
	communities: { name: string; background?: string }[];
	friends: string[];
};

export type SearchFilter = 'post' | 'user' | 'community';

export type SettingsCategory = 'account' | 'privacy' | 'notifications' | 'accessibility' | 'voice';

export type ProfileVisibility = 'public' | 'private';

export type MessageRequestsAudience = 'everyone' | 'followers' | 'none';

export type NotificationAudience = 'everyone' | 'friends' | 'following' | 'off';

export type SettingsPrefs = {
	account: { displayName: string; username: string; email: string; twoFactor: boolean };
	privacy: {
		profileVisibility: ProfileVisibility;
		showReadActivity: boolean;
		readReceipts: boolean;
		typingIndicators: boolean;
		showCloseFriendsBadge: boolean;
		messageRequests: MessageRequestsAudience;
	};
	notifications: Record<Exclude<NotificationKind, 'friend_request'>, NotificationAudience> & {
		friend_request: boolean;
	};
	mutedSenders: { notFollowing: boolean; notFollowedBy: boolean };
	accessibility: { reduceMotion: boolean; compactDensity: boolean };
	voice: { noiseSuppression: boolean; echoCancellation: boolean; microphone: string; camera: string };
};

export type SearchUser = {
	name: string;
	detail: string;
	status: 'online' | 'away' | 'offline';
	dmId?: string;
	community: string;
};
