import { Phone, Pin, Search, UserPlus, Video } from 'lucide-react';
import { useState } from 'react';
import { buildDmThread, mutualFriendsByDm } from '../../appData';
import shared from '../../styles/shared.module.css';
import type { Community, DirectMessage } from '../../types';
import type { ContextMenuItem } from '../ContextMenu';
import ConversationView from '../ConversationView';
import styles from '../WorkspaceContent.module.css';

type DmViewProps = {
	dm: DirectMessage;
	communities: Community[];
	openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null, toggle?: boolean) => void;
};

export default function DmView({ dm, communities, openMenu }: DmViewProps) {
	const [metaOpen, setMetaOpen] = useState(false);
	const mutualCommunities = communities.filter((community) =>
		community.members.some((member) => member.name === dm.name),
	);
	return (
		<main className={`${styles.workspaceContent} ${styles.dmLayout}`}>
			<header className={styles.dmBar} onMouseEnter={() => setMetaOpen(true)} onMouseLeave={() => setMetaOpen(false)}>
				<span className={styles.dmBarAvatarWrap}>
					<span className={styles.dmBarAvatar}>{dm.name[0]}</span>
					<span className={`${shared.statusDot} ${shared[dm.status]} ${shared.presenceDot}`} />
				</span>
				<div className={styles.dmBarIdentity}>
					<h2 className={styles.dmBarName}>
						{dm.name}
						<span className={styles.dmBarHandle}>{dm.username}</span>
					</h2>
					<p className={styles.dmBarStatus}>{dm.customStatus}</p>
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
					key={dm.id}
					peerName={dm.name}
					initialMessages={buildDmThread(dm.id, dm.name, dm.preview)}
					mutuals={{
						communities: mutualCommunities.map((community) => ({
							name: community.name,
							background: community.color,
						})),
						friends: mutualFriendsByDm[dm.id] ?? [],
					}}
					metaOpen={metaOpen}
					edgeScrollbar
					openMenu={openMenu}
				/>
			</section>
		</main>
	);
}
