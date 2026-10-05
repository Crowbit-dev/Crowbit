import { Copy, Link2, MessageCircle, Trash2 } from 'lucide-react';
import { useMemo, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { copyText } from '../../lib/clipboard';
import { gradientCommunityColor } from '../../lib/communityColor';
import { postSlug } from '../../lib/postSlug';
import { postLink } from '../../lib/site';
import type { Community, Post, SettingsPrefs } from '../../types';
import type { ContextMenuItem } from '../ContextMenu';
import styles from '../WorkspaceContent.module.css';
import PostCard from './PostCard';
import TriangulatedMosaic from './TriangulatedMosaic';

type FeedViewProps = {
	posts: Post[];
	communities: Community[];
	feedScope: string;
	threadShift: number;
	settingsPrefs: SettingsPrefs;
	onOpenThread: (post: Post) => void;
	onDeletePost: (post: Post) => void;
	openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null, toggle?: boolean) => void;
};

export default function FeedView({
	posts,
	communities,
	feedScope,
	threadShift,
	settingsPrefs,
	onOpenThread,
	onDeletePost,
	openMenu,
}: FeedViewProps) {
	const joinedCommunityIds = useMemo(
		() => new Set(communities.filter((community) => community.joined).map((community) => community.id)),
		[communities],
	);

	const openPostMenu = (e: ReactMouseEvent<HTMLElement>, post: Post) => {
		e.preventDefault();
		const slug = postSlug(post.author, post.title);
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
				onSelect: () => void copyText(postLink(slug)),
			},
		];
		if (post.author === 'You') {
			items.push({ type: 'separator' });
			// LOCAL-ONLY: deletes from in-memory App state; nothing persists without a backend.
			items.push({
				icon: <Trash2 size={16} aria-hidden="true" />,
				label: 'Delete Post',
				danger: true,
				onSelect: () => void onDeletePost(post),
			});
		}
		openMenu(e.clientX, e.clientY, items, e.currentTarget);
	};

	const visiblePosts =
		feedScope === 'all'
			? posts
			: feedScope === 'home'
				? posts.filter((post) => post.community === '' || joinedCommunityIds.has(post.community))
				: posts.filter((post) => post.community === feedScope);
	const scopedCommunity =
		feedScope !== 'all' && feedScope !== 'home'
			? communities.find((community) => community.id === feedScope)
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
						<p>
							Nothing from{' '}
							{feedScope === 'home'
								? 'your spaces'
								: (communities.find((entry) => entry.id === feedScope)?.name ?? feedScope)}{' '}
							so far — try another space.
						</p>
					</div>
				) : (
					visiblePosts.map((post) => {
						const showTag = post.community !== '' && (feedScope === 'all' || feedScope === 'home');
						const community = showTag ? communities.find((entry) => entry.id === post.community) : undefined;
						return (
							<PostCard
								key={`${post.author}-${post.title}`}
								post={post}
								community={
									community
										? { name: community.name, color: community.color }
										: showTag && post.community
											? { name: post.community }
											: null
								}
								showCloseFriendsBadge={settingsPrefs.privacy.showCloseFriendsBadge}
								showImage
								onOpenThread={onOpenThread}
								onContextMenu={(e, target) => openPostMenu(e, target)}
							/>
						);
					})
				)}
			</section>
		</main>
	);
}
