import type { CSSProperties } from 'react';
import { gradientCommunityColor } from '../../lib/communityColor';
import { searchFilterLabels } from '../../lib/searchFilterLabels';
import { matchCommunities, matchPosts, matchUsers } from '../../lib/searchMatching';
import type { Community, DirectMessage, Post, SearchFilter, SearchUser, SettingsPrefs } from '../../types';
import styles from '../WorkspaceContent.module.css';
import PostCard from './PostCard';

type SearchResultsViewProps = {
	posts: Post[];
	communities: Community[];
	directMessages: DirectMessage[];
	searchFilter: SearchFilter;
	appliedSearchQuery: string;
	settingsPrefs: SettingsPrefs;
	onOpenThread: (post: Post) => void;
	onOpenProfile: (username: string) => void;
	onOpenChannel: (communityId: string, channelId: string) => void;
	onOpenDm: (dmId: string) => void;
	onToggleJoin: (communityId: string) => void;
	onResetSearch: () => void;
};

export default function SearchResultsView({
	posts,
	communities,
	directMessages,
	searchFilter,
	appliedSearchQuery,
	settingsPrefs,
	onOpenThread,
	onOpenProfile,
	onOpenChannel,
	onOpenDm,
	onToggleJoin,
	onResetSearch,
}: SearchResultsViewProps) {
	const q = appliedSearchQuery.trim().toLowerCase();
	const matchedPosts = searchFilter === 'user' || searchFilter === 'community' ? [] : matchPosts(posts, q);
	const matchedUsers =
		searchFilter === 'post' || searchFilter === 'community' ? [] : matchUsers(communities, directMessages, q);
	const matchedCommunities = searchFilter === 'post' || searchFilter === 'user' ? [] : matchCommunities(communities, q);
	const totalResults = matchedPosts.length + matchedUsers.length + matchedCommunities.length;
	const statusLabel = (status: SearchUser['status']) =>
		status === 'online' ? 'Online' : status === 'away' ? 'Idle' : 'Offline';
	const openUser = (user: SearchUser) => {
		if (user.dmId) {
			onOpenDm(user.dmId);
			return;
		}
		const community = communities.find((entry) => entry.id === user.community);
		if (community) onOpenChannel(community.id, community.channels[0]?.id ?? 'general');
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
							const community = post.community ? communities.find((entry) => entry.id === post.community) : undefined;
							return (
								<PostCard
									key={post.id}
									post={post}
									community={
										community
											? { name: community.name, color: community.color }
											: post.community
												? { name: post.community }
												: null
									}
									showCloseFriendsBadge={settingsPrefs.privacy.showCloseFriendsBadge}
									clickable
									onOpenThread={onOpenThread}
									onOpenProfile={onOpenProfile}
								/>
							);
						})}
						{matchedCommunities.map((community) => {
							const openResult = () => onOpenChannel(community.id, community.channels[0]?.id ?? 'general');
							return (
								<article
									key={community.id}
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
												onToggleJoin(community.id);
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
