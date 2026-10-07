import {
	AtSign,
	Bell,
	CircleHelp,
	FileText,
	Headphones,
	Heart,
	History,
	House,
	LayoutGrid,
	MessageCircle,
	PersonStanding,
	Reply,
	Search,
	Shield,
	User,
	UserPlus,
	Users,
	X,
} from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import type {
	Community,
	DirectMessage,
	NotificationKind,
	SearchFilter,
	SettingsCategory,
	WorkspaceMode,
} from '../types';
import { notifications } from '../appData';
import { gradientCommunityColor } from '../lib/communityColor';
import { searchFilterLabels } from '../lib/searchFilterLabels';
import { notifFilterLabels } from '../lib/notifFilterLabels';
import shared from '../styles/shared.module.css';
import styles from './WorkspaceSidebar.module.css';

type WorkspaceSidebarProps = {
	mode: WorkspaceMode;
	communities: Community[];
	directMessages: DirectMessage[];
	activeCommunityId: string;
	activeDmId: string;
	feedScope: string;
	onSelectFeedScope: (scope: string) => void;
	notifFilter: 'all' | NotificationKind;
	onSelectNotifFilter: (filter: 'all' | NotificationKind) => void;
	searchFilter: SearchFilter;
	onSelectSearchFilter: (filter: SearchFilter) => void;
	recentSearches: string[];
	onCommitSearch: (query: string) => void;
	onClearRecentSearches: () => void;
	onSelectCommunity: (communityId: string) => void;
	onSelectChannel: (communityId: string, channelId: string) => void;
	onSelectDm: (dmId: string) => void;
	settingsCategory: SettingsCategory;
	onSelectSettingsCategory: (category: SettingsCategory) => void;
	searchQuery: string;
	onSearchQuery: (query: string) => void;
};

function SidebarSearch({
	value,
	onChange,
	onCommit,
	placeholder,
}: {
	value: string;
	onChange: (query: string) => void;
	onCommit?: (query: string) => void;
	placeholder: string;
}) {
	return (
		<label className={styles.sidebarSearchCard}>
			<Search aria-hidden="true" />
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter') onCommit?.(value);
				}}
				placeholder={placeholder}
				aria-label={placeholder}
				maxLength={80}
			/>
			{value && (
				<button
					type="button"
					className={styles.sidebarClear}
					onClick={() => onChange('')}
					aria-label="Clear search"
					title="Clear search"
				>
					<X size={14} aria-hidden="true" />
				</button>
			)}
		</label>
	);
}

function SidebarHeading({ id, kicker, title, copy }: { id: string; kicker: string; title: string; copy: string }) {
	const [dismissed, setDismissed] = useState(() => localStorage.getItem(`sidebar-heading-dismissed:${id}`) === '1');
	if (dismissed) return null;
	const dismiss = () => {
		localStorage.setItem(`sidebar-heading-dismissed:${id}`, '1');
		setDismissed(true);
	};
	return (
		<div className={styles.sidebarHeadingBlock}>
			<button
				type="button"
				className={styles.sidebarHeadingDismiss}
				onClick={dismiss}
				aria-label="Dismiss introduction"
				title="Dismiss"
			>
				<X size={14} aria-hidden="true" />
			</button>
			<p className={styles.sidebarKicker}>{kicker}</p>
			<h2>{title}</h2>
			<p className={styles.sidebarCopy}>{copy}</p>
		</div>
	);
}

function WorkspaceSidebar({
	mode,
	communities,
	directMessages,
	activeCommunityId,
	activeDmId,
	feedScope,
	onSelectFeedScope,
	notifFilter,
	onSelectNotifFilter,
	searchFilter,
	onSelectSearchFilter,
	recentSearches,
	onCommitSearch,
	onClearRecentSearches,
	onSelectCommunity,
	onSelectDm,
	settingsCategory,
	onSelectSettingsCategory,
	searchQuery,
	onSearchQuery,
}: WorkspaceSidebarProps) {
	const activeCommunity = communities.find((community) => community.id === activeCommunityId) ?? communities[0];
	const query = searchQuery.trim().toLowerCase();

	if (mode === 'feed') {
		const visibleCommunities = query
			? communities.filter((community) => community.name.toLowerCase().includes(query))
			: communities;

		return (
			<aside className={styles.workspaceSidebar}>
				<SidebarHeading
					key="feed"
					id="feed"
					kicker="Feed"
					title="Your spaces"
					copy="Choose a space to catch up on its latest posts."
				/>

				<SidebarSearch value={searchQuery} onChange={onSearchQuery} placeholder="Search the network" />

				<div className={styles.sidebarSection}>
					<div className={styles.sidebarSectionHead}>
						<span>Spaces</span>
						<span>{communities.length}</span>
					</div>
					<div className={styles.sidebarList}>
						{!query && (
							<>
								<button
									type="button"
									className={`${styles.sidebarItem} ${feedScope === 'all' ? styles.active : ''}`}
									onClick={() => onSelectFeedScope('all')}
								>
									<span className={styles.sidebarItemIcon}>
										<LayoutGrid aria-hidden="true" />
									</span>
									<span className={styles.sidebarItemCopy}>
										<strong>All</strong>
										<span>Every space</span>
									</span>
								</button>
								<button
									type="button"
									className={`${styles.sidebarItem} ${feedScope === 'home' ? styles.active : ''}`}
									onClick={() => onSelectFeedScope('home')}
								>
									<span className={styles.sidebarItemIcon}>
										<House aria-hidden="true" />
									</span>
									<span className={styles.sidebarItemCopy}>
										<strong>Home</strong>
										<span>Your spaces</span>
									</span>
								</button>
							</>
						)}
						{visibleCommunities.map((community) => (
							<button
								key={community.id}
								type="button"
								className={`${styles.sidebarItem} ${feedScope === community.id ? styles.active : ''}`}
								style={{ '--community-color': gradientCommunityColor(community.color) } as CSSProperties}
								onClick={() => onSelectFeedScope(community.id)}
							>
								<span className={shared.sidebarDot} style={{ background: community.color }} />
								<span className={styles.sidebarItemCopy}>
									<strong>{community.name}</strong>
									<span>{community.members.length} members</span>
								</span>
							</button>
						))}
						{visibleCommunities.length === 0 && (
							<p className={styles.sidebarEmpty}>No spaces match “{searchQuery.trim()}”.</p>
						)}
					</div>
				</div>
			</aside>
		);
	}

	if (mode === 'dms') {
		const visibleFriends = query
			? directMessages.filter((message) => `${message.name} ${message.customStatus}`.toLowerCase().includes(query))
			: directMessages;

		return (
			<aside className={styles.workspaceSidebar}>
				<SidebarHeading
					key="dms"
					id="dms"
					kicker="Direct messages"
					title="Conversations"
					copy="Pick up where you left off with friends."
				/>

				<SidebarSearch value={searchQuery} onChange={onSearchQuery} placeholder="Search friends" />

				<div className={styles.sidebarSection}>
					<div className={styles.sidebarSectionHead}>
						<span>Friends</span>
						<span>{directMessages.length}</span>
					</div>
					<div className={styles.sidebarList}>
						{visibleFriends.map((message) => (
							<button
								key={message.id}
								type="button"
								className={`${styles.sidebarItem} ${activeDmId === message.id ? styles.active : ''}`}
								onClick={() => onSelectDm(message.id)}
							>
								<span className={styles.sidebarPresence}>
									<span className={styles.sidebarAvatar}>{message.name[0]}</span>
									<span className={`${shared.statusDot} ${shared[message.status]} ${shared.presenceDot}`} />
								</span>
								<span className={styles.sidebarItemCopy}>
									<strong>{message.name}</strong>
									<span>{message.customStatus}</span>
								</span>
							</button>
						))}
						{visibleFriends.length === 0 && (
							<p className={styles.sidebarEmpty}>No friends match “{searchQuery.trim()}”.</p>
						)}
					</div>
				</div>
			</aside>
		);
	}

	if (mode === 'notifications') {
		const filters = [
			{ id: 'all', icon: <LayoutGrid size={16} aria-hidden="true" /> },
			{ id: 'mention', icon: <AtSign size={16} aria-hidden="true" /> },
			{ id: 'like', icon: <Heart size={16} aria-hidden="true" /> },
			{ id: 'friend_request', icon: <UserPlus size={16} aria-hidden="true" /> },
			{ id: 'reply', icon: <Reply size={16} aria-hidden="true" /> },
			{ id: 'comment', icon: <MessageCircle size={16} aria-hidden="true" /> },
		] as const;
		const countFor = (id: 'all' | NotificationKind) =>
			id === 'all' ? notifications.length : notifications.filter((item) => item.kind === id).length;

		return (
			<aside className={styles.workspaceSidebar}>
				<SidebarHeading
					key="notifications"
					id="notifications"
					kicker="Notifications"
					title="Inbox"
					copy="Unread Activity."
				/>

				<SidebarSearch value={searchQuery} onChange={onSearchQuery} placeholder="Search activity" />

				<div className={styles.sidebarSection}>
					<div className={styles.sidebarSectionHead}>
						<span>Filters</span>
					</div>
					<div className={styles.sidebarList}>
						{filters.map((filter) => (
							<button
								key={filter.id}
								type="button"
								className={`${styles.sidebarItem} ${notifFilter === filter.id ? styles.active : ''}`}
								onClick={() => onSelectNotifFilter(filter.id)}
							>
								<span className={styles.sidebarItemIcon}>{filter.icon}</span>
								<span className={styles.sidebarItemCopy}>
									<strong>{notifFilterLabels[filter.id]}</strong>
								</span>
								<span className={shared.sidebarUnreadCount}>{countFor(filter.id)}</span>
							</button>
						))}
					</div>
				</div>
			</aside>
		);
	}

	if (mode === 'search') {
		const filters = [
			{ id: 'post', icon: <FileText size={16} aria-hidden="true" /> },
			{ id: 'user', icon: <User size={16} aria-hidden="true" /> },
			{ id: 'community', icon: <Users size={16} aria-hidden="true" /> },
		] as const;

		return (
			<aside className={styles.workspaceSidebar}>
				<SidebarHeading
					key="search"
					id="search"
					kicker="Search"
					title="Find anything"
					copy="Search posts, users, and communities from one place."
				/>

				<SidebarSearch
					value={searchQuery}
					onChange={onSearchQuery}
					onCommit={onCommitSearch}
					placeholder="Search the network"
				/>

				<div className={styles.sidebarSection}>
					<div className={styles.sidebarSectionHead}>
						<span>Filters</span>
					</div>
					<div className={styles.sidebarList}>
						{filters.map((filter) => (
							<button
								key={filter.id}
								type="button"
								className={`${styles.sidebarItem} ${searchFilter === filter.id ? styles.active : ''}`}
								onClick={() => onSelectSearchFilter(filter.id)}
							>
								<span className={styles.sidebarItemIcon}>{filter.icon}</span>
								<span className={styles.sidebarItemCopy}>
									<strong>{searchFilterLabels[filter.id]}</strong>
								</span>
							</button>
						))}
					</div>
				</div>

				{recentSearches.length > 0 && (
					<div className={styles.sidebarSection}>
						<div className={styles.sidebarSectionHead}>
							<span>Recent</span>
							<button type="button" className={styles.sidebarSectionAction} onClick={onClearRecentSearches}>
								Clear
							</button>
						</div>
						<div className={styles.sidebarList}>
							{recentSearches.map((entry) => (
								<button
									key={entry}
									type="button"
									className={`${styles.sidebarItem} ${styles.compact}`}
									onClick={() => onCommitSearch(entry)}
								>
									<span className={styles.sidebarItemIcon}>
										<History size={16} aria-hidden="true" />
									</span>
									<span className={styles.sidebarItemCopy}>
										<strong>{entry}</strong>
									</span>
								</button>
							))}
						</div>
					</div>
				)}
			</aside>
		);
	}

	if (mode === 'settings') {
		const categories = [
			{ id: 'account', label: 'Account', icon: <User size={16} aria-hidden="true" /> },
			{ id: 'privacy', label: 'Privacy', icon: <Shield size={16} aria-hidden="true" /> },
			{ id: 'notifications', label: 'Notifications', icon: <Bell size={16} aria-hidden="true" /> },
			{ id: 'accessibility', label: 'Accessibility', icon: <PersonStanding size={16} aria-hidden="true" /> },
			{ id: 'voice', label: 'Voice & Video', icon: <Headphones size={16} aria-hidden="true" /> },
			{ id: 'help', label: 'Help center', icon: <CircleHelp size={16} aria-hidden="true" /> },
		] as const;
		return (
			<aside className={`${styles.workspaceSidebar} ${styles.settingsSidebar}`}>
				<h2 className={styles.settingsHeading}>Settings</h2>

				<div className={styles.sidebarSection}>
					<div className={styles.sidebarList}>
						{categories.map((category) => (
							<button
								key={category.id}
								type="button"
								className={`${styles.sidebarItem} ${settingsCategory === category.id ? styles.active : ''}`}
								onClick={() => onSelectSettingsCategory(category.id)}
							>
								<span className={styles.sidebarItemIcon}>{category.icon}</span>
								<span className={styles.sidebarItemCopy}>
									<strong>{category.label}</strong>
								</span>
							</button>
						))}
					</div>
				</div>
			</aside>
		);
	}

	return (
		<aside
			className={`${styles.workspaceSidebar} ${styles.communityEdge}`}
			style={{ '--community-color': gradientCommunityColor(activeCommunity.color) } as CSSProperties}
		>
			<SidebarHeading
				key="communities"
				id="communities"
				kicker="Communities"
				title="All spaces"
				copy="Select a community to view its channels and members."
			/>

			<SidebarSearch value={searchQuery} onChange={onSearchQuery} placeholder="Search communities" />

			<div className={styles.sidebarSection}>
				<div className={styles.sidebarSectionHead}>
					<span>Spaces</span>
					<span>{communities.length}</span>
				</div>
				<div className={styles.sidebarList}>
					{(query ? communities.filter((community) => community.name.toLowerCase().includes(query)) : communities).map(
						(community) => (
							<button
								key={community.id}
								type="button"
								className={`${styles.sidebarItem} ${styles.compact} ${activeCommunity.id === community.id ? styles.active : ''}`}
								style={{ '--community-color': gradientCommunityColor(community.color) } as CSSProperties}
								onClick={() => onSelectCommunity(community.id)}
							>
								<span className={shared.sidebarDot} style={{ background: community.color }} />
								<span className={styles.sidebarItemCopy}>
									<strong>{community.name}</strong>
								</span>
							</button>
						),
					)}
					{query && !communities.some((community) => community.name.toLowerCase().includes(query)) && (
						<p className={styles.sidebarEmpty}>No spaces match “{searchQuery.trim()}”.</p>
					)}
				</div>
			</div>
		</aside>
	);
}

export default WorkspaceSidebar;
