import { currentUser } from '../../appData';
import type { Community, Post, SettingsPrefs } from '../../types';
import styles from '../WorkspaceContent.module.css';
import PostCard from './PostCard';

type ProfileViewProps = {
	posts: Post[];
	communities: Community[];
	settingsPrefs: SettingsPrefs;
	onOpenThread: (post: Post) => void;
};

export default function ProfileView({ posts, communities, settingsPrefs, onOpenThread }: ProfileViewProps) {
	const displayName = settingsPrefs.account.displayName || currentUser.displayName;
	const username = (settingsPrefs.account.username || currentUser.username).replace(/^@+/, '');
	const myPosts = posts.filter((post) => post.author === 'You');
	const joinedCount = communities.filter((community) => community.joined).length;
	return (
		<main className={styles.workspaceContent}>
			<section className={`${styles.panelStack} ${styles.feedStack}`}>
				<div className={styles.feedCommunityRow}>
					<span className={styles.feedCommunityIcon} aria-hidden="true">
						{displayName.charAt(0).toUpperCase() || '?'}
					</span>
					<div className={styles.feedCommunityCopy}>
						<h2>{displayName}</h2>
						<p>
							@{username} · {myPosts.length} {myPosts.length === 1 ? 'post' : 'posts'} · {joinedCount}{' '}
							{joinedCount === 1 ? 'space' : 'spaces'}
						</p>
					</div>
				</div>
				{myPosts.length === 0 ? (
					<div className={styles.emptyState}>
						<strong>No posts here yet</strong>
						<p>Anything you post will show up on your profile.</p>
					</div>
				) : (
					myPosts.map((post) => {
						const community = post.community ? communities.find((entry) => entry.id === post.community) : undefined;
						return (
							<PostCard
								key={`${post.author}-${post.title}`}
								post={post}
								community={
									community
										? { name: community.name, color: community.color }
										: post.community
											? { name: post.community }
											: null
								}
								showCloseFriendsBadge={settingsPrefs.privacy.showCloseFriendsBadge}
								showImage
								clickable
								onOpenThread={onOpenThread}
							/>
						);
					})
				)}
			</section>
		</main>
	);
}
