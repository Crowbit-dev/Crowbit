import { useMemo } from 'react';
import type {
	Community,
	DirectMessage,
	NotificationItem,
	Post,
	SearchFilter,
	SettingsCategory,
	SettingsPrefs,
	WorkspaceMode,
} from '../../types';
import type { ProfileUser } from '../../lib/profileUser';
import type { ContextMenuItem } from '../ContextMenu';
import CommunityView from './CommunityView';
import DmView from './DmView';
import FeedView from './FeedView';
import NotificationsView from './NotificationsView';
import ProfileView from './ProfileView';
import SearchResultsView from './SearchResultsView';
import SettingsView from './SettingsView';

type WorkspaceContentProps = {
	mode: WorkspaceMode;
	communities: Community[];
	posts: Post[];
	directMessages: DirectMessage[];
	activeCommunityId: string;
	activeChannelId: string;
	activeDmId: string;
	feedScope: string;
	notifFilter: 'all' | NotificationItem['kind'];
	searchFilter: SearchFilter;
	appliedSearchQuery: string;
	onOpenChannel: (communityId: string, channelId: string) => void;
	onOpenDm: (dmId: string) => void;
	onOpenDmWithName: (name: string) => void;
	onToggleJoin: (communityId: string) => void;
	settingsCategory: SettingsCategory;
	settingsPrefs: SettingsPrefs;
	onUpdateSettings: <K extends keyof SettingsPrefs>(section: K, patch: Partial<SettingsPrefs[K]>) => void;
	onOpenThread: (post: Post) => void;
	onOpenProfile: (username: string) => void;
	profileUser: ProfileUser | null;
	onDeletePost: (post: Post) => void;
	threadShift: number;
	openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null, toggle?: boolean) => void;
	searchQuery: string;
	onResetSearch: () => void;
};

function WorkspaceContent({
	mode,
	communities,
	posts,
	directMessages,
	activeCommunityId,
	activeChannelId,
	activeDmId,
	feedScope,
	notifFilter,
	searchFilter,
	appliedSearchQuery,
	onOpenChannel,
	onOpenDm,
	onOpenDmWithName,
	onToggleJoin,
	settingsCategory,
	settingsPrefs,
	onUpdateSettings,
	onOpenThread,
	onOpenProfile,
	profileUser,
	onDeletePost,
	threadShift,
	openMenu,
	searchQuery,
	onResetSearch,
}: WorkspaceContentProps) {
	const activeCommunity = useMemo(
		() => communities.find((community) => community.id === activeCommunityId) ?? communities[0],
		[activeCommunityId, communities],
	);
	const activeDm = useMemo(
		() => directMessages.find((message) => message.id === activeDmId) ?? directMessages[0],
		[activeDmId, directMessages],
	);

	if (mode === 'dms') {
		return <DmView dm={activeDm} communities={communities} openMenu={openMenu} onOpenProfile={onOpenProfile} />;
	}

	if (mode === 'notifications') {
		return (
			<NotificationsView
				notifFilter={notifFilter}
				searchQuery={searchQuery}
				posts={posts}
				communities={communities}
				settingsPrefs={settingsPrefs}
				onOpenThread={onOpenThread}
				onOpenChannel={onOpenChannel}
			/>
		);
	}

	if (mode === 'search') {
		return (
			<SearchResultsView
				posts={posts}
				communities={communities}
				directMessages={directMessages}
				searchFilter={searchFilter}
				appliedSearchQuery={appliedSearchQuery}
				settingsPrefs={settingsPrefs}
				onOpenThread={onOpenThread}
				onOpenChannel={onOpenChannel}
				onOpenDm={onOpenDm}
				onToggleJoin={onToggleJoin}
				onResetSearch={onResetSearch}
				onOpenProfile={onOpenProfile}
			/>
		);
	}

	if (mode === 'settings') {
		return (
			<SettingsView
				settingsCategory={settingsCategory}
				settingsPrefs={settingsPrefs}
				onUpdateSettings={onUpdateSettings}
			/>
		);
	}

	if (mode === 'communities') {
		return (
			<CommunityView
				community={activeCommunity}
				activeChannelId={activeChannelId}
				onOpenChannel={onOpenChannel}
				onOpenDmWithName={onOpenDmWithName}
				openMenu={openMenu}
			/>
		);
	}

	if (mode === 'profile') {
		return (
			<ProfileView
				profileUser={profileUser}
				posts={posts}
				communities={communities}
				settingsPrefs={settingsPrefs}
				onOpenThread={onOpenThread}
				onOpenProfile={onOpenProfile}
			/>
		);
	}

	return (
		<FeedView
			posts={posts}
			communities={communities}
			feedScope={feedScope}
			threadShift={threadShift}
			settingsPrefs={settingsPrefs}
			onOpenThread={onOpenThread}
			onOpenProfile={onOpenProfile}
			onDeletePost={onDeletePost}
			openMenu={openMenu}
		/>
	);
}

export default WorkspaceContent;
