import {
	ArrowBigUp,
	AtSign,
	Ban,
	CheckCheck,
	ChevronDown,
	ChevronRight,
	Copy,
	Ellipsis,
	Hash,
	Heart,
	Link2,
	MessageCircle,
	Phone,
	Pin,
	Reply,
	Search,
	Share2,
	Trash2,
	User,
	UserPlus,
	UserX,
	Users,
	Video,
	VolumeX,
} from 'lucide-react';
import { useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import type {
	Community,
	CommunityMember,
	DirectMessage,
	MessageRequestsAudience,
	NotificationItem,
	Post,
	ProfileVisibility,
	SearchFilter,
	SearchUser,
	SettingsCategory,
	SettingsPrefs,
	WorkspaceMode,
} from '../types';
import { buildChannelThread, buildDmThread, mutualFriendsByDm, notifications, currentUser } from '../appData';
import { copyText } from '../lib/clipboard';
import { postLink, profileLink } from '../lib/site';
import shared from '../styles/shared.module.css';
import type { ContextMenuItem } from './ContextMenu';
import ConversationView from './ConversationView';
import { SettingRadioGroup, SettingRow, SettingSelect, SettingEditableText, SettingToggle } from './SettingControls';
import settingStyles from './SettingControls.module.css';
import { delaunay, type DelaunayPoint } from '../lib/delaunay';
import { formatCount } from '../lib/formatCount';
import { gradientCommunityColor } from '../lib/communityColor';
import { notifFilterLabels } from '../lib/notifFilterLabels';
import { searchFilterLabels } from '../lib/searchFilterLabels';
import { matchCommunities, matchPosts, matchUsers } from '../lib/searchMatching';
import styles from './WorkspaceContent.module.css';

type WorkspaceContentProps = {
	mode: WorkspaceMode;
	communities: Community[];
	posts: Post[];
	directMessages: DirectMessage[];
	activeCommunityName: string;
	activeChannelId: string;
	activeDmId: string;
	feedScope: string;
	notifFilter: 'all' | NotificationItem['kind'];
	searchFilter: SearchFilter;
	appliedSearchQuery: string;
	onOpenChannel: (communityName: string, channelId: string) => void;
	onOpenDm: (dmId: string) => void;
	onOpenDmWithName: (name: string) => void;
	onToggleJoin: (communityName: string) => void;
	settingsCategory: SettingsCategory;
	settingsPrefs: SettingsPrefs;
	onUpdateSettings: <K extends keyof SettingsPrefs>(section: K, patch: Partial<SettingsPrefs[K]>) => void;
	onOpenThread: (post: Post) => void;
	onDeletePost: (post: Post) => void;
	threadShift: number;
	openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null, toggle?: boolean) => void;
	searchQuery: string;
	onResetSearch: () => void;
};

function hashSeed(value: string): number {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function TriangulatedMosaic({ seed }: { seed: string }) {
	const width = 1080;
	const height = 128;
	const cols = 22;
	const rows = 8;
	const base = hashSeed(seed);
	const random = (n: number) => {
		const x = Math.sin(base + n * 0.61803398875) * 10000;
		return x - Math.floor(x);
	};
	const points: DelaunayPoint[] = [
		{ x: 0, y: 0 },
		{ x: width, y: 0 },
		{ x: 0, y: height },
		{ x: width, y: height },
	];
	for (let row = 0; row <= rows; row++) {
		for (let col = 0; col <= cols; col++) {
			if ((row === 0 || row === rows) && (col === 0 || col === cols)) continue;
			const edgeX = row === 0 || row === rows;
			const edgeY = col === 0 || col === cols;
			const jx = edgeX ? 0 : (random(row * 131 + col * 17 + 1) - 0.5) * (width / cols) * 0.9;
			const jy = edgeY ? 0 : (random(row * 131 + col * 17 + 2) - 0.5) * (height / rows) * 0.9;
			points.push({
				x: Math.min(width, Math.max(0, (col / cols) * width + jx)),
				y: Math.min(height, Math.max(0, (row / rows) * height + jy)),
			});
		}
	}
	const triangles = delaunay(points);
	return (
		<svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
			{triangles.map((triangle, index) => {
				const dark = random(index * 2 + 0.25) > 0.5;
				return (
					<polygon
						key={index}
						points={triangle.map((pointIndex) => `${points[pointIndex].x},${points[pointIndex].y}`).join(' ')}
						fill={dark ? '#000000' : '#ffffff'}
						opacity={Math.round(random(index * 2 + 0.75) * 22) / 100}
					/>
				);
			})}
		</svg>
	);
}

function WorkspaceContent({
	mode,
	communities,
	posts,
	directMessages,
	activeCommunityName,
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
	onDeletePost,
	threadShift,
	openMenu,
	searchQuery,
	onResetSearch,
}: WorkspaceContentProps) {
	const activeCommunity = useMemo(
		() => communities.find((community) => community.name === activeCommunityName) ?? communities[0],
		[activeCommunityName, communities],
	);
	const activeChannel = useMemo(
		() => activeCommunity.channels.find((channel) => channel.id === activeChannelId) ?? activeCommunity.channels[0],
		[activeChannelId, activeCommunity],
	);
	const activeDm = useMemo(
		() => directMessages.find((message) => message.id === activeDmId) ?? directMessages[0],
		[activeDmId, directMessages],
	);
	const mutualCommunities = useMemo(
		() => communities.filter((community) => community.members.some((member) => member.name === activeDm.name)),
		[activeDm.name, communities],
	);
	const joinedCommunityNames = useMemo(
		() => new Set(communities.filter((community) => community.joined).map((community) => community.name)),
		[communities],
	);
	const [metaOpen, setMetaOpen] = useState(false);
	const [paneTab, setPaneTab] = useState<'channels' | 'members'>('channels');

	const openMemberMenu = (
		x: number,
		y: number,
		member: CommunityMember,
		invoker: HTMLElement | null,
		toggle = false,
	) => {
		// LOCAL-ONLY: handle and id are derived from the mock name; a real backend would provide both.
		const handle = `@${member.name.toLowerCase()}`;
		const id = member.name.toLowerCase();
		const items: ContextMenuItem[] = [
			{ icon: <Copy size={16} aria-hidden="true" />, label: 'Copy Username', onSelect: () => void copyText(handle) },
			{ icon: <Copy size={16} aria-hidden="true" />, label: 'Copy User ID', onSelect: () => void copyText(id) },
			// LOCAL-ONLY: fake link; no backend route exists for it yet.
			{
				icon: <Link2 size={16} aria-hidden="true" />,
				label: 'Copy Profile Link',
				onSelect: () => void copyText(profileLink(id)),
			},
			{ type: 'separator' },
			{
				icon: <MessageCircle size={16} aria-hidden="true" />,
				label: 'Message',
				onSelect: () => onOpenDmWithName(member.name),
			},
			{ icon: <User size={16} aria-hidden="true" />, label: 'View Profile', onSelect: () => {} },
			{ type: 'separator' },
			// TEMPORARY: decorative until moderation lands.
			{ icon: <VolumeX size={16} aria-hidden="true" />, label: 'Mute', onSelect: () => {} },
			{ icon: <UserX size={16} aria-hidden="true" />, label: 'Kick', danger: true, onSelect: () => {} },
			{ icon: <Ban size={16} aria-hidden="true" />, label: 'Ban', danger: true, onSelect: () => {} },
		];
		openMenu(x, y, items, invoker, toggle);
	};

	const openMemberMenuAtEvent = (e: ReactMouseEvent<HTMLElement>, member: CommunityMember, toggle = false) => {
		e.preventDefault();
		openMemberMenu(e.clientX, e.clientY, member, e.currentTarget, toggle);
	};

	if (mode === 'dms') {
		return (
			<main className={`${styles.workspaceContent} ${styles.dmLayout}`}>
				<header className={styles.dmBar} onMouseEnter={() => setMetaOpen(true)} onMouseLeave={() => setMetaOpen(false)}>
					<span className={styles.dmBarAvatarWrap}>
						<span className={styles.dmBarAvatar}>{activeDm.name[0]}</span>
						<span className={`${shared.statusDot} ${shared[activeDm.status]} ${shared.presenceDot}`} />
					</span>
					<div className={styles.dmBarIdentity}>
						<h2 className={styles.dmBarName}>
							{activeDm.name}
							<span className={styles.dmBarHandle}>@{activeDm.id}</span>
						</h2>
						<p className={styles.dmBarStatus}>{activeDm.customStatus}</p>
					</div>
					<div className={styles.dmBarActions}>
						<button type="button" className={styles.dmBarAction} aria-label="Start voice call">
							<Phone size={17} aria-hidden="true" />
						</button>
						<button type="button" className={styles.dmBarAction} aria-label="Start video call">
							<Video size={17} aria-hidden="true" />
						</button>
						{/* TEMPORARY: decorative until pins land. */}
						<button type="button" className={styles.dmBarAction} aria-label="Pinned messages">
							<Pin size={17} aria-hidden="true" />
						</button>
						{/* TEMPORARY: decorative until group DMs land. */}
						<button type="button" className={styles.dmBarAction} aria-label="Create group">
							<UserPlus size={17} aria-hidden="true" />
						</button>
						{/* TEMPORARY: decorative until message search lands. */}
						<label className={styles.dmBarSearch}>
							<Search size={15} aria-hidden="true" />
							<input type="search" placeholder="Search" aria-label="Search conversation" />
						</label>
					</div>
				</header>

				<section className={`${styles.panelStack} ${styles.conversationPanel}`}>
					<ConversationView
						key={activeDm.id}
						peerName={activeDm.name}
						initialMessages={buildDmThread(activeDm.id, activeDm.name, activeDm.preview)}
						mutuals={{
							communities: mutualCommunities.map((community) => ({
								name: community.name,
								background: community.color,
							})),
							friends: mutualFriendsByDm[activeDm.id] ?? [],
						}}
						metaOpen={metaOpen}
						edgeScrollbar
						openMenu={openMenu}
					/>
				</section>
			</main>
		);
	}

	if (mode === 'notifications') {
		const q = searchQuery.trim().toLowerCase();
		const visibleItems = notifications.filter(
			(item) =>
				settingsPrefs.notifications[item.kind] &&
				(notifFilter === 'all' || item.kind === notifFilter) &&
				(!q || `${item.actor} ${item.community} ${item.channel} ${item.snippet}`.toLowerCase().includes(q)),
		);
		const openItem = (item: NotificationItem) => {
			if ((item.kind === 'like' || item.kind === 'comment') && item.postTitle) {
				const post = posts.find((entry) => entry.title === item.postTitle);
				if (post) {
					onOpenThread(post);
					return;
				}
			}
			onOpenChannel(item.community, item.channel);
		};

		return (
			<main className={styles.workspaceContent}>
				<header className={styles.notifBar}>
					<h2>Inbox</h2>
					{notifFilter !== 'all' && (
						<>
							<span className={styles.postDivider}>·</span>
							<span className={styles.notifBarFilter}>{notifFilterLabels[notifFilter]}</span>
						</>
					)}
					<div className={styles.notifBarActions}>
						{/* TEMPORARY: decorative until read-state lands. */}
						<button type="button" className={styles.dmBarAction} aria-label="Mark all read" title="Mark all read">
							<CheckCheck size={17} aria-hidden="true" />
						</button>
					</div>
				</header>

				<section className={`${styles.panelStack} ${styles.notifList}`}>
					{notifications.length === 0 ? (
						<div className={styles.emptyState}>
							<strong>You&apos;re all caught up</strong>
							<p>New mentions and replies will land here.</p>
						</div>
					) : visibleItems.length === 0 ? (
						<div className={styles.emptyState}>
							<strong>Nothing here</strong>
							<p>No activity matches this filter yet — try another one.</p>
						</div>
					) : (
						visibleItems.map((item) => {
							const color = communities.find((community) => community.name === item.community)?.color ?? '#533e52';
							if (item.kind === 'friend_request') {
								return (
									<article key={item.id} className={styles.notifRow}>
										<span className={styles.notifAvatar}>{item.actor[0]}</span>
										<span className={styles.notifKind}>
											<UserPlus size={14} aria-hidden="true" />
										</span>
										<span className={styles.notifCopy}>
											<span className={styles.notifText}>
												<strong>{item.actor}</strong>
												{' sent you a friend request'}
											</span>
											<span className={styles.notifMeta}>
												<span className={shared.sidebarDot} style={{ background: color }} />
												{item.community} · {item.time}
											</span>
											<span className={styles.notifFollowActions}>
												{/* TEMPORARY: decorative until friend requests land. */}
												<button type="button" className={styles.contentChip}>
													Accept
												</button>
												<button type="button" className={styles.contentChip}>
													Decline
												</button>
											</span>
										</span>
									</article>
								);
							}
							const kindIcon =
								item.kind === 'mention' ? (
									<AtSign size={14} aria-hidden="true" />
								) : item.kind === 'like' ? (
									<Heart size={14} aria-hidden="true" />
								) : item.kind === 'comment' ? (
									<MessageCircle size={14} aria-hidden="true" />
								) : (
									<Reply size={14} aria-hidden="true" />
								);
							const kindVerb =
								item.kind === 'mention'
									? 'mentioned you'
									: item.kind === 'like'
										? 'liked your post'
										: item.kind === 'comment'
											? 'commented on your post'
											: 'replied to you';
							return (
								<button
									key={item.id}
									type="button"
									className={styles.notifRow}
									onClick={() => openItem(item)}
									aria-label={`${item.actor} ${kindVerb} — ${item.snippet}`}
								>
									<span className={styles.notifAvatar}>{item.actor[0]}</span>
									<span className={styles.notifKind}>{kindIcon}</span>
									<span className={styles.notifCopy}>
										<span className={styles.notifText}>
											<strong>{item.actor}</strong>
											{` ${kindVerb} `}
											{(item.kind === 'mention' || item.kind === 'reply') && (
												<>
													in <strong>#{item.channel}</strong>
												</>
											)}
										</span>
										<span className={styles.notifSnippet}>{item.snippet}</span>
										<span className={styles.notifMeta}>
											<span className={shared.sidebarDot} style={{ background: color }} />
											{item.community} · {item.time}
										</span>
									</span>
								</button>
							);
						})
					)}
				</section>
			</main>
		);
	}

	if (mode === 'search') {
		const q = appliedSearchQuery.trim().toLowerCase();
		const matchedPosts = searchFilter === 'user' || searchFilter === 'community' ? [] : matchPosts(posts, q);
		const matchedUsers =
			searchFilter === 'post' || searchFilter === 'community' ? [] : matchUsers(communities, directMessages, q);
		const matchedCommunities =
			searchFilter === 'post' || searchFilter === 'user' ? [] : matchCommunities(communities, q);
		const totalResults = matchedPosts.length + matchedUsers.length + matchedCommunities.length;
		const statusLabel = (status: SearchUser['status']) =>
			status === 'online' ? 'Online' : status === 'away' ? 'Idle' : 'Offline';
		const openUser = (user: SearchUser) => {
			if (user.dmId) {
				onOpenDm(user.dmId);
				return;
			}
			const community = communities.find((entry) => entry.name === user.community);
			if (community) onOpenChannel(community.name, community.channels[0]?.id ?? 'general');
		};

		return (
			<main className={styles.workspaceContent}>
				<section className={`${styles.panelStack} ${styles.resultsCard}`}>
					<div className={styles.sectionHeadingRow}>
						<h2>
							{q ? `Results for "${appliedSearchQuery.trim()}"` : 'Search'}
							<span className={styles.resultFilterCrumb}> · {searchFilterLabels[searchFilter]}</span>
						</h2>
						{q && <span>{totalResults} items</span>}
					</div>
					{!q ? (
						<div className={styles.emptyState}>
							<strong>Search the network</strong>
							<p>Type a keyword and press Enter to search posts, users, and communities.</p>
						</div>
					) : totalResults === 0 ? (
						<div className={styles.emptyState}>
							<strong>No results for “{appliedSearchQuery.trim()}”</strong>
							<p>Try a different keyword, or browse spaces and friends instead.</p>
							<div>
								<button type="button" className={styles.contentChip} onClick={onResetSearch}>
									Clear search
								</button>
							</div>
						</div>
					) : (
						<div className={styles.resultList}>
							{matchedPosts.map((post) => {
								const openResult = () => onOpenThread(post);
								return (
									<article
										key={post.title}
										className={`${styles.postCard} ${styles.resultPostCard}`}
										onClick={openResult}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												openResult();
											}
										}}
										role="button"
										tabIndex={0}
										aria-label={`${post.title} by ${post.author} — open thread`}
									>
										<div className={styles.postHeader}>
											{/* TEMPORARY: author, handle, avatar, and community tag show link affordance until click-through lands. */}
											<div className={styles.avatar}>{post.author[0]}</div>
											<div className={styles.postMeta}>
												<div className={styles.postAuthorRow}>
													<strong>{post.author}</strong>
													<span className={styles.postHandle}>{post.handle}</span>
													<span className={styles.postDivider}>•</span>
													<span className={styles.postTime}>{post.time}</span>
												</div>
												{post.community && (
													<div className={styles.communityTag}>
														<span
															className={shared.sidebarDot}
															style={{
																background: communities.find((community) => community.name === post.community)?.color,
															}}
															aria-hidden="true"
														/>
														<span>{post.community}</span>
													</div>
												)}
												{post.audience === 'closeFriends' && settingsPrefs.privacy.showCloseFriendsBadge && (
													<span className={styles.closeFriendsTag}>
														<span className={styles.closeFriendsDot} aria-hidden="true" />
														Close friends
													</span>
												)}
											</div>
										</div>

										<h3>{post.title}</h3>
										{post.body && <p className={styles.postBody}>{post.body}</p>}

										<div className={styles.postStats}>
											<button
												type="button"
												className={styles.postAction}
												aria-label={`Upvote ${post.title}`}
												onClick={(e) => e.stopPropagation()}
											>
												<ArrowBigUp aria-hidden="true" />
												<span>{formatCount(post.stats.upvotes)}</span>
											</button>
											<button
												type="button"
												className={styles.postAction}
												aria-label={`View comments for ${post.title}`}
												onClick={(e) => {
													e.stopPropagation();
													onOpenThread(post);
												}}
											>
												<MessageCircle aria-hidden="true" />
												<span>{formatCount(post.stats.comments)}</span>
											</button>
											<button
												type="button"
												className={styles.postAction}
												aria-label={`Share ${post.title}`}
												onClick={(e) => e.stopPropagation()}
											>
												<Share2 aria-hidden="true" />
												<span>{formatCount(post.stats.shares)}</span>
											</button>
										</div>
									</article>
								);
							})}
							{matchedCommunities.map((community) => {
								const openResult = () => onOpenChannel(community.name, community.channels[0]?.id ?? 'general');
								return (
									<article
										key={community.name}
										className={styles.resultCommunityCard}
										style={{ '--community-color': gradientCommunityColor(community.color) } as CSSProperties}
										onClick={openResult}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												openResult();
											}
										}}
										role="button"
										tabIndex={0}
										aria-label={`${community.name} community — open`}
									>
										<div className={styles.resultCommunityRow}>
											<div className={styles.resultCommunityCopy}>
												<strong>{community.name}</strong>
												<p>
													{community.members.length} members · {community.channels.length} channels
												</p>
											</div>
											<button
												type="button"
												className={styles.contentChip}
												onClick={(e) => {
													e.stopPropagation();
													onToggleJoin(community.name);
												}}
												aria-label={community.joined ? `Leave ${community.name}` : `Join ${community.name}`}
											>
												{community.joined ? 'Joined' : 'Join'}
											</button>
										</div>
									</article>
								);
							})}
							{matchedUsers.length > 0 && (
								<div className={styles.userDividerList}>
									{matchedUsers.map((user) => (
										<button
											key={user.name}
											type="button"
											className={styles.userRow}
											onClick={() => openUser(user)}
											aria-label={`${user.name} — ${user.detail}`}
										>
											<span className={styles.userRowBox}>
												<span className={styles.notifAvatar}>{user.name[0]}</span>
												<span className={styles.notifCopy}>
													<span className={styles.notifText}>
														<strong>{user.name}</strong>
													</span>
													<span className={styles.notifMeta}>
														{user.detail ? `${user.detail} · ` : ''}
														{statusLabel(user.status)}
													</span>
												</span>
											</span>
										</button>
									))}
								</div>
							)}
						</div>
					)}
				</section>
			</main>
		);
	}

	if (mode === 'settings') {
		return (
			<main className={styles.workspaceContent}>
				<section className={styles.panelStack}>
					{settingsCategory === 'account' && (
						<div>
							<h3 className={settingStyles.subHead}>Account info</h3>
							<SettingRow
								label="Display name"
								copy="Displayed on your profile and posts."
								control={
									<SettingEditableText
										value={settingsPrefs.account.displayName}
										fallback={currentUser.displayName}
										onSave={(next) => onUpdateSettings('account', { displayName: next })}
										label="Display name"
									/>
								}
							/>
							<SettingRow
								label="Username"
								copy="Your unique handle across the network."
								control={
									<SettingEditableText
										value={settingsPrefs.account.username}
										fallback={currentUser.username.replace(/^@+/, '')}
										prefix="@"
										onSave={(next) => onUpdateSettings('account', { username: next.replace(/^@+/, '') })}
										label="Username"
									/>
								}
							/>
							<SettingRow
								label="Email"
								copy="Used for sign-in and notifications."
								control={
									<SettingEditableText
										value={settingsPrefs.account.email}
										fallback={currentUser.email}
										onSave={(next) => onUpdateSettings('account', { email: next })}
										label="Email"
									/>
								}
							/>
							<h3 className={settingStyles.subHead}>Password &amp; security</h3>
							<SettingRow
								label="Two-factor authentication"
								copy="Require a code when signing in."
								control={
									<SettingToggle
										checked={settingsPrefs.account.twoFactor}
										onChange={(next) => onUpdateSettings('account', { twoFactor: next })}
										label="Two-factor authentication"
									/>
								}
							/>
							<SettingRow
								label="Active sessions"
								copy="Review the devices signed in to your account."
								control={
									<>
										{/* TEMPORARY: opens the device list once it exists. */}
										<button type="button" className={settingStyles.plainButton} aria-label="View active sessions">
											1 session
											<ChevronRight size={14} aria-hidden="true" />
										</button>
									</>
								}
							/>
							<SettingRow
								label="Password"
								copy="yeah, no. password123 isn't going to cut it."
								control={
									<>
										{/* TEMPORARY: decorative until password change lands. */}
										<button type="button" className={settingStyles.plainButton}>
											Change password
										</button>
									</>
								}
							/>
							<h3 className={settingStyles.subHead}>Danger zone</h3>
							<SettingRow
								label="Disable account"
								copy="Take a break from the network and hide your profile."
								control={
									<>
										{/* TEMPORARY: decorative until account disabling lands. */}
										<button type="button" className={settingStyles.plainButton}>
											Disable account
										</button>
									</>
								}
							/>
							<SettingRow
								label="Delete account"
								copy="Permanently remove your account and data."
								control={
									<>
										{/* TEMPORARY: decorative until account deletion lands. */}
										<button type="button" className={settingStyles.dangerButton}>
											Delete account
										</button>
									</>
								}
							/>
						</div>
					)}
					{settingsCategory === 'privacy' && (
						<div>
							<h3 className={settingStyles.subHead}>Visibility</h3>
							<SettingRow
								label="Profile visibility"
								copy="Who can view your profile."
								control={
									<SettingRadioGroup
										value={settingsPrefs.privacy.profileVisibility}
										onChange={(next) => onUpdateSettings('privacy', { profileVisibility: next as ProfileVisibility })}
										label="Profile visibility"
										options={[
											{ value: 'public', label: 'Public' },
											{ value: 'private', label: 'Private' },
										]}
									/>
								}
							/>
							<SettingRow
								label="Show read activity"
								copy="Let others see what you have read."
								control={
									<SettingToggle
										checked={settingsPrefs.privacy.showReadActivity}
										onChange={(next) => onUpdateSettings('privacy', { showReadActivity: next })}
										label="Show read activity"
									/>
								}
							/>
							<SettingRow
								label="Close friends"
								copy="People who see your closest updates."
								control={
									<>
										{/* TEMPORARY: decorative until close friends management lands. */}
										<button type="button" className={settingStyles.plainButton}>
											Manage
										</button>
									</>
								}
							/>
							<h3 className={settingStyles.subHead}>Messaging</h3>
							<SettingRow
								label="Message requests"
								copy="Who can send you message requests."
								control={
									<SettingRadioGroup
										value={settingsPrefs.privacy.messageRequests}
										onChange={(next) =>
											onUpdateSettings('privacy', { messageRequests: next as MessageRequestsAudience })
										}
										label="Message requests"
										options={[
											{ value: 'everyone', label: 'Everyone' },
											{ value: 'followers', label: 'Followers' },
											{ value: 'none', label: 'No one' },
										]}
									/>
								}
							/>
							<SettingRow
								label="Read receipts"
								copy="Send read confirmations in conversations."
								control={
									<SettingToggle
										checked={settingsPrefs.privacy.readReceipts}
										onChange={(next) => onUpdateSettings('privacy', { readReceipts: next })}
										label="Read receipts"
									/>
								}
							/>
							<SettingRow
								label="Typing indicators"
								copy="Show when you are typing a message."
								control={
									<SettingToggle
										checked={settingsPrefs.privacy.typingIndicators}
										onChange={(next) => onUpdateSettings('privacy', { typingIndicators: next })}
										label="Typing indicators"
									/>
								}
							/>
							<h3 className={settingStyles.subHead}>Blocked users</h3>
							<SettingRow
								label="Block list"
								copy="People who cannot contact you or see your activity."
								control={
									<>
										{/* TEMPORARY: decorative until block list management lands. */}
										<button type="button" className={settingStyles.plainButton}>
											Manage
										</button>
									</>
								}
							/>
						</div>
					)}
					{settingsCategory === 'notifications' && (
						<div>
							{(['mention', 'like', 'friend_request', 'reply', 'comment'] as const).map((kind) => (
								<SettingRow
									key={kind}
									label={notifFilterLabels[kind]}
									copy={`Show ${notifFilterLabels[kind].toLowerCase()} in your inbox.`}
									control={
										<SettingToggle
											checked={settingsPrefs.notifications[kind]}
											onChange={(next) => onUpdateSettings('notifications', { [kind]: next })}
											label={notifFilterLabels[kind]}
										/>
									}
								/>
							))}
						</div>
					)}
					{settingsCategory === 'accessibility' && (
						<div>
							<SettingRow
								label="Reduce motion"
								copy="Disable animations and transitions."
								control={
									<SettingToggle
										checked={settingsPrefs.accessibility.reduceMotion}
										onChange={(next) => onUpdateSettings('accessibility', { reduceMotion: next })}
										label="Reduce motion"
									/>
								}
							/>
							<SettingRow
								label="Compact density"
								copy="Tighter spacing in lists and cards."
								control={
									<SettingToggle
										checked={settingsPrefs.accessibility.compactDensity}
										onChange={(next) => onUpdateSettings('accessibility', { compactDensity: next })}
										label="Compact density"
									/>
								}
							/>
						</div>
					)}
					{settingsCategory === 'voice' && (
						<div>
							<SettingRow
								label="Noise suppression"
								copy="Filter background noise from your microphone."
								control={
									<SettingToggle
										checked={settingsPrefs.voice.noiseSuppression}
										onChange={(next) => onUpdateSettings('voice', { noiseSuppression: next })}
										label="Noise suppression"
									/>
								}
							/>
							<SettingRow
								label="Echo cancellation"
								copy="Prevent echo during voice calls."
								control={
									<SettingToggle
										checked={settingsPrefs.voice.echoCancellation}
										onChange={(next) => onUpdateSettings('voice', { echoCancellation: next })}
										label="Echo cancellation"
									/>
								}
							/>
							<SettingRow
								label="Microphone"
								control={
									<SettingSelect
										value={settingsPrefs.voice.microphone}
										onChange={(next) => onUpdateSettings('voice', { microphone: next })}
										label="Microphone"
										options={['Default', 'Built-in Microphone', 'USB Headset']}
									/>
								}
							/>
							<SettingRow
								label="Camera"
								control={
									<SettingSelect
										value={settingsPrefs.voice.camera}
										onChange={(next) => onUpdateSettings('voice', { camera: next })}
										label="Camera"
										options={['Off', 'FaceTime HD Camera', 'USB Camera']}
									/>
								}
							/>
						</div>
					)}
				</section>
			</main>
		);
	}

	if (mode === 'communities') {
		return (
			<main
				className={`${styles.workspaceContent} ${styles.communitiesLayout}`}
				style={{ '--community-color': activeCommunity.color } as CSSProperties}
			>
				<header className={styles.communityBar}>
					<button
						type="button"
						className={styles.communityBarCommunity}
						onClick={() => setPaneTab((prev) => (prev === 'channels' ? 'members' : 'channels'))}
						aria-expanded={paneTab === 'members'}
						aria-label={`${activeCommunity.name}: ${paneTab === 'channels' ? 'show members' : 'show channels'}`}
					>
						<span className={styles.communityBarPill}>
							<span className={styles.communityBarName}>{activeCommunity.name}</span>
							<Users size={17} aria-hidden="true" className={styles.communityBarMembers} />
							<ChevronDown size={17} aria-hidden="true" className={styles.communityBarChevron} />
						</span>
					</button>
					<div className={styles.communityBarMain}>
						<strong># {activeChannel.name}</strong>
						<span className={styles.postDivider}>·</span>
						<span className={styles.communityBarTopic}>{activeChannel.topic}</span>
						<div className={styles.communityBarActions}>
							{/* TEMPORARY: decorative until channel pins land. */}
							<button type="button" className={styles.dmBarAction} aria-label="Pinned messages">
								<Pin size={17} aria-hidden="true" />
							</button>
							{/* TEMPORARY: decorative until channel search lands. */}
							<label className={styles.dmBarSearch}>
								<Search size={15} aria-hidden="true" />
								<input type="search" placeholder="Search" aria-label="Search channel" />
							</label>
						</div>
					</div>
				</header>

				<div className={styles.communitiesBody}>
					<aside
						className={styles.channelPane}
						aria-label={paneTab === 'channels' ? `${activeCommunity.name} channels` : `${activeCommunity.name} members`}
					>
						<div className={styles.channelGrid}>
							{activeCommunity.channels.map((channel) => (
								<button
									key={channel.id}
									type="button"
									onClick={() => onOpenChannel(activeCommunity.name, channel.id)}
									title={channel.topic}
									aria-current={activeChannel.id === channel.id ? 'true' : undefined}
									className={`${styles.channelCard} ${activeChannel.id === channel.id ? styles.active : ''}`}
								>
									<Hash size={16} aria-hidden="true" />
									<strong>{channel.name}</strong>
									{(channel.unread ?? 0) > 0 && <span className={shared.sidebarUnreadCount}>{channel.unread}</span>}
								</button>
							))}
						</div>
						<div
							className={`${styles.memberOverlay} ${paneTab === 'members' ? styles.memberOverlayOpen : ''}`}
							aria-hidden={paneTab !== 'members'}
						>
							<div className={styles.memberOverlaySlide}>
								{activeCommunity.members.map((member) => (
									<div
										key={member.name}
										className={styles.memberCard}
										title={member.role}
										onContextMenu={(e) => openMemberMenuAtEvent(e, member)}
									>
										<span className={styles.memberPresence}>
											<span className={styles.memberAvatar}>{member.name[0]}</span>
											<span className={`${shared.statusDot} ${shared[member.status]} ${shared.presenceDot}`} />
										</span>
										<span className={styles.memberCopy}>
											<span className={styles.memberNameRow}>
												<strong>{member.name}</strong>
												<span className={styles.memberHandle}>@{member.name.toLowerCase()}</span>
											</span>
											<span>{member.role}</span>
										</span>
										<button
											type="button"
											className={styles.memberOptions}
											onClick={(e) => openMemberMenuAtEvent(e, member, true)}
											aria-label={`${member.name} options`}
											title="Member options"
										>
											<Ellipsis size={16} aria-hidden="true" />
										</button>
									</div>
								))}
							</div>
						</div>
					</aside>
					<div className={styles.channelConversation}>
						<ConversationView
							key={`${activeCommunity.name}-${activeChannel.id}`}
							peerName={`# ${activeChannel.name}`}
							initialMessages={buildChannelThread(
								activeChannel,
								activeCommunity.name,
								activeCommunity.members.map((member) => member.name),
							)}
							edgeScrollbar
							moderationCommunity={activeCommunity}
							onMessageUser={onOpenDmWithName}
							openMenu={openMenu}
						/>
					</div>
				</div>
			</main>
		);
	}

	const openPostMenu = (e: ReactMouseEvent<HTMLElement>, post: Post) => {
		e.preventDefault();
		// LOCAL-ONLY: slug is fabricated; no backend route exists for it yet.
		const postSlug = `${post.author}-${post.title}`
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
		// Capture the highlight now — opening the menu collapses the selection.
		const selection = window.getSelection()?.toString().trim() ?? '';
		const items: ContextMenuItem[] = [
			...(selection
				? [
						{
							icon: <Copy size={16} aria-hidden="true" />,
							label: 'Copy',
							hint: 'Ctrl + C',
							onSelect: () => void copyText(selection),
						},
					]
				: []),
			{
				icon: <Copy size={16} aria-hidden="true" />,
				label: 'Copy Text',
				onSelect: () => void copyText(post.body ? `${post.title}\n\n${post.body}` : post.title),
			},
			{
				icon: <MessageCircle size={16} aria-hidden="true" />,
				label: 'Open Thread',
				onSelect: () => onOpenThread(post),
			},
			{
				icon: <Link2 size={16} aria-hidden="true" />,
				label: 'Copy Post Link',
				onSelect: () => void copyText(postLink(postSlug)),
			},
		];
		if (post.author === 'You') {
			items.push({ type: 'separator' });
			// LOCAL-ONLY: deletes from in-memory App state; nothing persists without a backend.
			items.push({
				icon: <Trash2 size={16} aria-hidden="true" />,
				label: 'Delete Post',
				danger: true,
				onSelect: () => onDeletePost(post),
			});
		}
		openMenu(e.clientX, e.clientY, items, e.currentTarget);
	};

	const visiblePosts =
		feedScope === 'all'
			? posts
			: feedScope === 'home'
				? posts.filter((post) => post.community === '' || joinedCommunityNames.has(post.community))
				: posts.filter((post) => post.community === feedScope);
	const scopedCommunity =
		feedScope !== 'all' && feedScope !== 'home'
			? communities.find((community) => community.name === feedScope)
			: undefined;
	const scopedOnline = scopedCommunity?.members.filter((member) => member.status !== 'offline').length ?? 0;

	return (
		<main className={styles.workspaceContent}>
			<section
				className={`${styles.panelStack} ${styles.feedStack} ${threadShift > 0 ? styles.threadShift : ''}`}
				style={threadShift > 0 ? ({ '--thread-shift': `${threadShift}px` } as CSSProperties) : undefined}
			>
				{scopedCommunity && (
					<header
						className={styles.feedCommunityHeader}
						style={{ '--community-color': gradientCommunityColor(scopedCommunity.color) } as CSSProperties}
					>
						<div className={styles.feedCommunityBanner} aria-hidden="true">
							<TriangulatedMosaic seed={scopedCommunity.name} />
						</div>
						<div className={styles.feedCommunityRow}>
							<span className={styles.feedCommunityIcon} aria-hidden="true">
								{scopedCommunity.name[0]}
							</span>
							<div className={styles.feedCommunityCopy}>
								<h2>{scopedCommunity.name}</h2>
								<p>
									{scopedCommunity.members.length} members · {scopedOnline} online
								</p>
								<p>{scopedCommunity.bio}</p>
							</div>
							{/* TEMPORARY: decorative until membership actions land. */}
							<button
								type="button"
								className={styles.contentChip}
								aria-label={scopedCommunity.joined ? `Leave ${scopedCommunity.name}` : `Join ${scopedCommunity.name}`}
							>
								{scopedCommunity.joined ? 'Joined' : 'Join'}
							</button>
						</div>
					</header>
				)}
				{visiblePosts.length === 0 ? (
					<div className={styles.emptyState}>
						<strong>No posts here yet</strong>
						<p>Nothing from {feedScope === 'home' ? 'your spaces' : feedScope} so far — try another space.</p>
					</div>
				) : (
					visiblePosts.map((post) => (
						<article
							key={`${post.author}-${post.title}`}
							className={styles.postCard}
							onContextMenu={(e) => openPostMenu(e, post)}
						>
							<div className={styles.postHeader}>
								{/* TEMPORARY: author, handle, avatar, and community tag show link affordance until click-through lands. */}
								<div className={styles.avatar}>{post.author[0]}</div>
								<div className={styles.postMeta}>
									<div className={styles.postAuthorRow}>
										<strong>{post.author}</strong>
										<span className={styles.postHandle}>{post.handle}</span>
										<span className={styles.postDivider}>•</span>
										<span className={styles.postTime}>{post.time}</span>
									</div>
									{post.community && (feedScope === 'all' || feedScope === 'home') && (
										<div className={styles.communityTag}>
											<span
												className={shared.sidebarDot}
												style={{
													background: communities.find((community) => community.name === post.community)?.color,
												}}
												aria-hidden="true"
											/>
											<span>{post.community}</span>
										</div>
									)}
									{post.audience === 'closeFriends' && settingsPrefs.privacy.showCloseFriendsBadge && (
										<span className={styles.closeFriendsTag}>
											<span className={styles.closeFriendsDot} aria-hidden="true" />
											Close friends
										</span>
									)}
								</div>
							</div>

							<h3>{post.title}</h3>
							{post.image && <img className={styles.postImage} src={post.image} alt="Placeholder post visual" />}
							{post.body && <p className={styles.postBody}>{post.body}</p>}

							<div className={styles.postStats}>
								<button type="button" className={styles.postAction} aria-label={`Upvote ${post.title}`}>
									<ArrowBigUp aria-hidden="true" />
									<span>{formatCount(post.stats.upvotes)}</span>
								</button>
								<button
									type="button"
									className={styles.postAction}
									aria-label={`View comments for ${post.title}`}
									onClick={() => onOpenThread(post)}
								>
									<MessageCircle aria-hidden="true" />
									<span>{formatCount(post.stats.comments)}</span>
								</button>
								<button type="button" className={styles.postAction} aria-label={`Share ${post.title}`}>
									<Share2 aria-hidden="true" />
									<span>{formatCount(post.stats.shares)}</span>
								</button>
							</div>
						</article>
					))
				)}
			</section>
		</main>
	);
}

export default WorkspaceContent;
