import { ArrowBigUp, MessageCircle, Share2, Star } from 'lucide-react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { formatCount } from '../../lib/formatCount';
import shared from '../../styles/shared.module.css';
import type { Post } from '../../types';
import styles from '../WorkspaceContent.module.css';

type PostCardProps = {
	post: Post;
	community?: { name: string; color?: string } | null;
	showCloseFriendsBadge: boolean;
	showImage?: boolean;
	clickable?: boolean;
	onOpenThread: (post: Post) => void;
	onOpenProfile: (username: string) => void;
	onContextMenu?: (e: ReactMouseEvent<HTMLElement>, post: Post) => void;
};

export default function PostCard({
	post,
	community,
	showCloseFriendsBadge,
	showImage = false,
	clickable = false,
	onOpenThread,
	onOpenProfile,
	onContextMenu,
}: PostCardProps) {
	const openResult = () => onOpenThread(post);
	const openProfile = (e: ReactMouseEvent<HTMLElement>) => {
		if (clickable) e.stopPropagation();
		onOpenProfile(post.handle.replace(/^@+/, ''));
	};
	return (
		<article
			className={`${styles.postCard} ${clickable ? styles.resultPostCard : ''}`}
			onClick={clickable ? openResult : undefined}
			onKeyDown={
				clickable
					? (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								openResult();
							}
						}
					: undefined
			}
			onContextMenu={onContextMenu ? (e) => onContextMenu(e, post) : undefined}
			role={clickable ? 'button' : undefined}
			tabIndex={clickable ? 0 : undefined}
			aria-label={clickable ? `${post.title} by ${post.author} — open thread` : undefined}
		>
			<div className={styles.postHeader}>
				<button
					type="button"
					className={`${styles.avatar} ${styles.postAvatarButton}`}
					onClick={openProfile}
					aria-label={`Open ${post.author}'s profile`}
					title={`Open ${post.author}'s profile`}
				>
					{post.author[0]}
				</button>
				<div className={styles.postMeta}>
					<div className={styles.postAuthorRow}>
						<button
							type="button"
							className={styles.postProfileButton}
							onClick={openProfile}
							aria-label={`Open ${post.author}'s profile`}
						>
							<strong>{post.author}</strong>
						</button>
						<button
							type="button"
							className={styles.postProfileButton}
							onClick={openProfile}
							aria-label={`Open ${post.author}'s profile`}
						>
							<span className={styles.postHandle}>{post.handle}</span>
						</button>
						<span className={styles.postDivider}>•</span>
						<span className={styles.postTime}>{post.time}</span>
					</div>
					{community && (
						<div className={styles.communityTag}>
							{/* TEMPORARY: community tag shows link affordance until click-through lands. */}
							<span className={shared.sidebarDot} style={{ background: community.color }} aria-hidden="true" />
							<span>{community.name}</span>
						</div>
					)}
					{post.audience === 'closeFriends' && showCloseFriendsBadge && (
						<span className={styles.closeFriendsTag} title="Close friends">
							<Star size={12} fill="currentColor" aria-hidden="true" />
						</span>
					)}
				</div>
			</div>

			<h3>{post.title}</h3>
			{showImage && post.image && <img className={styles.postImage} src={post.image} alt="Placeholder post visual" />}
			{post.body && <p className={styles.postBody}>{post.body}</p>}

			<div className={styles.postStats}>
				<button
					type="button"
					className={styles.postAction}
					aria-label={`Upvote ${post.title}`}
					onClick={clickable ? (e) => e.stopPropagation() : undefined}
				>
					<ArrowBigUp aria-hidden="true" />
					<span>{formatCount(post.stats.upvotes)}</span>
				</button>
				<button
					type="button"
					className={styles.postAction}
					aria-label={`View comments for ${post.title}`}
					onClick={(e) => {
						if (clickable) e.stopPropagation();
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
					onClick={clickable ? (e) => e.stopPropagation() : undefined}
				>
					<Share2 aria-hidden="true" />
					<span>{formatCount(post.stats.shares)}</span>
				</button>
			</div>
		</article>
	);
}
