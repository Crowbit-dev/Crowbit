import { AtSign, CheckCheck, Heart, MessageCircle, Reply, UserPlus } from 'lucide-react';
import { notifications } from '../../appData';
import { notifFilterLabels } from '../../lib/notifFilterLabels';
import shared from '../../styles/shared.module.css';
import type { Community, NotificationItem, Post, SettingsPrefs } from '../../types';
import styles from '../WorkspaceContent.module.css';

type NotificationsViewProps = {
	notifFilter: 'all' | NotificationItem['kind'];
	searchQuery: string;
	posts: Post[];
	communities: Community[];
	settingsPrefs: SettingsPrefs;
	onOpenThread: (post: Post) => void;
	onOpenChannel: (communityId: string, channelId: string) => void;
};

export default function NotificationsView({
	notifFilter,
	searchQuery,
	posts,
	communities,
	settingsPrefs,
	onOpenThread,
	onOpenChannel,
}: NotificationsViewProps) {
	const q = searchQuery.trim().toLowerCase();
	const visibleItems = notifications.filter(
		(item) =>
			(item.kind === 'friend_request'
				? settingsPrefs.notifications.friend_request
				: settingsPrefs.notifications[item.kind] !== 'off') &&
			(notifFilter === 'all' || item.kind === notifFilter) &&
			(!q || `${item.actor} ${item.community} ${item.channel} ${item.snippet}`.toLowerCase().includes(q)),
	);
	const openItem = (item: NotificationItem) => {
		if ((item.kind === 'like' || item.kind === 'comment') && item.postId) {
			const post = posts.find((entry) => entry.id === item.postId);
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
						const community = communities.find((entry) => entry.id === item.community);
						const color = community?.color ?? '#533e52';
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
											{community?.name ?? item.community} · {item.time}
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
										{community?.name ?? item.community} · {item.time}
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
