import {
	Ban,
	ChevronDown,
	Copy,
	Ellipsis,
	Hash,
	Link2,
	MessageCircle,
	Pin,
	Search,
	User,
	UserX,
	Users,
	VolumeX,
} from 'lucide-react';
import { useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { buildChannelThread } from '../../appData';
import { copyText } from '../../lib/clipboard';
import { profileLink } from '../../lib/site';
import shared from '../../styles/shared.module.css';
import type { Community, CommunityMember } from '../../types';
import type { ContextMenuItem } from '../ContextMenu';
import ConversationView from '../ConversationView';
import styles from '../WorkspaceContent.module.css';

type CommunityViewProps = {
	community: Community;
	activeChannelId: string;
	onOpenChannel: (communityId: string, channelId: string) => void;
	onOpenDmWithName: (name: string) => void;
	openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null, toggle?: boolean) => void;
};

export default function CommunityView({
	community,
	activeChannelId,
	onOpenChannel,
	onOpenDmWithName,
	openMenu,
}: CommunityViewProps) {
	const [paneTab, setPaneTab] = useState<'channels' | 'members'>('channels');
	const activeChannel = community.channels.find((channel) => channel.id === activeChannelId) ?? community.channels[0];

	const openMemberMenu = (
		x: number,
		y: number,
		member: CommunityMember,
		invoker: HTMLElement | null,
		toggle = false,
	) => {
		// LOCAL-ONLY: handle is derived from the mock name; a real backend would provide it.
		const handle = `@${member.name.toLowerCase()}`;
		const items: ContextMenuItem[] = [
			{ icon: <Copy size={16} aria-hidden="true" />, label: 'Copy Username', onSelect: () => void copyText(handle) },
			{ icon: <Copy size={16} aria-hidden="true" />, label: 'Copy User ID', onSelect: () => void copyText(member.id) },
			// LOCAL-ONLY: fake link; no backend route exists for it yet.
			{
				icon: <Link2 size={16} aria-hidden="true" />,
				label: 'Copy Profile Link',
				onSelect: () => void copyText(profileLink(member.id)),
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

	return (
		<main
			className={`${styles.workspaceContent} ${styles.communitiesLayout}`}
			style={{ '--community-color': community.color } as CSSProperties}
		>
			<header className={styles.communityBar}>
				<button
					type="button"
					className={styles.communityBarCommunity}
					onClick={() => setPaneTab((prev) => (prev === 'channels' ? 'members' : 'channels'))}
					aria-expanded={paneTab === 'members'}
					aria-label={`${community.name}: ${paneTab === 'channels' ? 'show members' : 'show channels'}`}
				>
					<span className={styles.communityBarPill}>
						<span className={styles.communityBarName}>{community.name}</span>
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
					aria-label={paneTab === 'channels' ? `${community.name} channels` : `${community.name} members`}
				>
					<div className={styles.channelGrid}>
						{community.channels.map((channel) => (
							<button
								key={channel.id}
								type="button"
								onClick={() => onOpenChannel(community.id, channel.id)}
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
							{community.members.map((member) => (
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
						key={`${community.id}-${activeChannel.id}`}
						peerName={`# ${activeChannel.name}`}
						initialMessages={buildChannelThread(
							activeChannel,
							community.id,
							community.members.map((member) => member.name),
						)}
						edgeScrollbar
						moderationCommunity={community}
						onMessageUser={onOpenDmWithName}
						openMenu={openMenu}
					/>
				</div>
			</div>
		</main>
	);
}
