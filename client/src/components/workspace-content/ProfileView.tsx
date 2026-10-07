import { MessageCircle, UserPlus } from 'lucide-react';
import { currentUser } from '../../appData';
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
	onMessageUser: (name: string) => void;
};

export default function ProfileView({
	profileUser,
	posts,
	communities,
	settingsPrefs,
	onOpenThread,
	onOpenProfile,
	onMessageUser,
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
	const bioLine = profileUser.isSelf
		? currentUser.bio
		: communities.flatMap((community) => community.members).find((member) => member.name === profileUser.name)?.role;
	return (
		<main className={styles.workspaceContent}>
			<section className={`${styles.panelStack} ${styles.feedStack}`}>
				<div className={styles.profileHeader}>
					<div className={styles.profileTopRow}>
						<span className={styles.profileAvatar} aria-hidden="true">
							{profileUser.name.charAt(0).toUpperCase() || '?'}
						</span>
						<div className={styles.profileCopy}>
							<h2>{profileUser.name}</h2>
							<p>
								@{profileUser.username} · {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
							</p>
						</div>
						{!profileUser.isSelf && (
							<div className={styles.profileActions}>
								{/* TEMPORARY: decorative until friend requests land. */}
								<button type="button" className={styles.contentChip}>
									<UserPlus size={16} aria-hidden="true" />
									Add friend
								</button>
								<button
									type="button"
									className={styles.contentChip}
									onClick={() => onMessageUser(profileUser.name)}
									aria-label={`Message ${profileUser.name}`}
								>
									<MessageCircle size={16} aria-hidden="true" />
									Message
								</button>
							</div>
						)}
					</div>
					{bioLine && <p className={styles.profileBio}>{bioLine}</p>}
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
