import type { Community, Post, SettingsPrefs } from '../../types';
import type { ProfileUser } from '../../lib/profileUser';
import styles from '../WorkspaceContent.module.css';
import PostCard from './PostCard';

type ProfileViewProps = {
	profileUser: ProfileUser | null;
	posts: Post[];
	communities: Community[];
	settingsPrefs: SettingsPrefs;
	onOpenThread: (post: Post) => void;
	onOpenProfile: (username: string) => void;
};

export default function ProfileView({
	profileUser,
	posts,
	communities,
	settingsPrefs,
	onOpenThread,
	onOpenProfile,
}: ProfileViewProps) {
	if (!profileUser) {
		return (
			<main className={styles.workspaceContent}>
				<section className={`${styles.panelStack} ${styles.feedStack}`}>
					<div className={styles.emptyState}>
						<strong>Couldn&apos;t find this user</strong>
						<p>They may have changed their handle or deleted their account.</p>
					</div>
				</section>
			</main>
		);
	}
	const userPosts = posts.filter((post) =>
		profileUser.isSelf ? post.author === 'You' : post.author === profileUser.name,
	);
	const spaceCount = profileUser.isSelf
		? communities.filter((community) => community.joined).length
		: communities.filter((community) => community.members.some((member) => member.name === profileUser.name)).length;
	return (
		<main className={styles.workspaceContent}>
			<section className={`${styles.panelStack} ${styles.feedStack}`}>
				<div className={styles.feedCommunityRow}>
					<span className={styles.feedCommunityIcon} aria-hidden="true">
						{profileUser.name.charAt(0).toUpperCase() || '?'}
					</span>
					<div className={styles.feedCommunityCopy}>
						<h2>{profileUser.name}</h2>
						<p>
							@{profileUser.username} · {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'} · {spaceCount}{' '}
							{spaceCount === 1 ? 'space' : 'spaces'}
						</p>
					</div>
				</div>
				{userPosts.length === 0 ? (
					<div className={styles.emptyState}>
						<strong>No posts here yet</strong>
						<p>
							{profileUser.isSelf
								? 'Anything you post will show up on your profile.'
								: `${profileUser.name} hasn't posted anything yet.`}
						</p>
					</div>
				) : (
					userPosts.map((post) => {
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
								onOpenProfile={onOpenProfile}
							/>
						);
					})
				)}
			</section>
		</main>
	);
}
