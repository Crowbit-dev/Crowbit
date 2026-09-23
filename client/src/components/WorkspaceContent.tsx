import { ArrowBigUp, Copy, Hash, Link2, MessageCircle, Phone, Pin, Search, Share2, Shield, Trash2, UserPlus, Users, Video } from 'lucide-react'
import { useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import type { Community, DirectMessage, Post, WorkspaceMode } from '../appData'
import { copyText } from '../lib/clipboard'
import shared from '../styles/shared.module.css'
import type { ContextMenuItem } from './ContextMenu'
import ConversationView, { buildChannelThread } from './ConversationView'
import styles from './WorkspaceContent.module.css'

type WorkspaceContentProps = {
  mode: WorkspaceMode
  communities: Community[]
  posts: Post[]
  directMessages: DirectMessage[]
  activeCommunityName: string
  activeChannelId: string
  activeDmId: string
  onOpenChannel: (communityName: string, channelId: string) => void
  onOpenThread: (post: Post) => void
  onDeletePost: (post: Post) => void
  threadShift: number
  openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null) => void
  searchQuery: string
  onSearchQuery: (query: string) => void
}

// TEMPORARY: formats mock upvote counts until the backend provides real numbers.
const formatUpvotes = (value: number) => (value < 100 ? `${value}` : `${value}k`)

const mutualFriendsByDm: Record<string, string[]> = {
  maya: ['Jules', 'Sami', 'Theo'],
  jules: ['Maya', 'Sami'],
  sami: ['Maya', 'Jules', 'Theo', 'Noor'],
  theo: ['Maya'],
}

function WorkspaceContent({
  mode,
  communities,
  posts,
  directMessages,
  activeCommunityName,
  activeChannelId,
  activeDmId,
  onOpenChannel,
  onOpenThread,
  onDeletePost,
  threadShift,
  openMenu,
  searchQuery,
  onSearchQuery,
}: WorkspaceContentProps) {
  const activeCommunity = useMemo(
    () => communities.find((community) => community.name === activeCommunityName) ?? communities[0],
    [activeCommunityName, communities],
  )
  const activeChannel = useMemo(
    () => activeCommunity.channels.find((channel) => channel.id === activeChannelId) ?? activeCommunity.channels[0],
    [activeChannelId, activeCommunity],
  )
  const activeDm = useMemo(
    () => directMessages.find((message) => message.id === activeDmId) ?? directMessages[0],
    [activeDmId, directMessages],
  )
  const mutualCommunities = useMemo(
    () => communities.filter((community) => community.members.some((member) => member.name === activeDm.name)),
    [activeDm.name, communities],
  )
  const joinedCommunityNames = useMemo(
    () => new Set(communities.filter((community) => community.joined).map((community) => community.name)),
    [communities],
  )
  const [metaOpen, setMetaOpen] = useState(false)

  if (mode === 'dms') {
    return (
      <main className={styles.workspaceContent}>
        <header
          className={styles.dmBar}
          onMouseEnter={() => setMetaOpen(true)}
          onMouseLeave={() => setMetaOpen(false)}
        >
          <span className={styles.dmBarAvatarWrap}>
            <span className={styles.dmBarAvatar}>{activeDm.name[0]}</span>
            <span className={`${shared.statusDot} ${shared[activeDm.status]} ${shared.presenceDot}`} />
          </span>
          <div className={styles.dmBarIdentity}>
            <h2 className={styles.dmBarName}>{activeDm.name}<span className={styles.dmBarHandle}>@{activeDm.id}</span></h2>
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
            <button type="button" className={styles.dmBarAction} aria-label="Pinned messages (coming soon)">
              <Pin size={17} aria-hidden="true" />
            </button>
            {/* TEMPORARY: decorative until group DMs land. */}
            <button type="button" className={styles.dmBarAction} aria-label="Create group (coming soon)">
              <UserPlus size={17} aria-hidden="true" />
            </button>
            {/* TEMPORARY: decorative until message search lands. */}
            <label className={styles.dmBarSearch}>
              <Search size={15} aria-hidden="true" />
              <input type="search" placeholder="Search" aria-label="Search conversation (coming soon)" />
            </label>
          </div>
        </header>

        <section className={`${styles.panelStack} ${styles.conversationPanel}`}>
          <ConversationView
            key={activeDm.id}
            peerName={activeDm.name}
            initialMessages={[
              { id: `${activeDm.id}-1`, author: activeDm.name, time: 'Yesterday', body: activeDm.preview },
              { id: `${activeDm.id}-2`, author: 'You', time: 'Yesterday', body: 'I left feedback on the latest update and marked the next steps.' },
              { id: `${activeDm.id}-3`, author: activeDm.name, time: 'Today', body: 'I will send the revised version before the next check-in.' },
            ]}
            mutuals={{
              communities: mutualCommunities.map((community) => ({ name: community.name, background: community.color })),
              friends: mutualFriendsByDm[activeDm.id] ?? [],
            }}
            metaOpen={metaOpen}
            edgeScrollbar
            openMenu={openMenu}
          />
        </section>
      </main>
    )
  }

  if (mode === 'notifications') {
    const unreadChannels = communities.flatMap((community) =>
      community.channels
        .filter((channel) => (channel.unread ?? 0) > 0)
        .map((channel) => ({ community, channel })),
    )
    const totalUnread = unreadChannels.reduce((sum, entry) => sum + (entry.channel.unread ?? 0), 0)

    return (
      <main className={styles.workspaceContent}>
        <section className={`${styles.panelStack} ${styles.resultsCard}`}>
          <div className={styles.sectionHeadingRow}>
            <h2>Unread</h2>
            <span>{totalUnread} messages</span>
          </div>
          {unreadChannels.length === 0 ? (
            <article className={styles.infoCard}>
              <strong>You&apos;re all caught up</strong>
              <p>New mentions and replies will land here.</p>
            </article>
          ) : (
            <div className={styles.resultList}>
              {unreadChannels.map(({ community, channel }) => (
                <button
                  key={`${community.name}-${channel.id}`}
                  type="button"
                  className={`${styles.resultRow} ${styles.notificationRow}`}
                  onClick={() => onOpenChannel(community.name, channel.id)}
                  aria-label={`Open ${channel.name} in ${community.name}, ${channel.unread} unread messages`}
                >
                  <span className={shared.sidebarDot} style={{ background: community.color }} />
                  <div>
                    <strong>#{channel.name}</strong>
                    <p>{community.name} · {channel.topic}</p>
                  </div>
                  <span className={shared.sidebarUnreadCount}>{channel.unread}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    )
  }

  if (mode === 'search') {
    const q = searchQuery.trim().toLowerCase()
    const matchedPosts = q
      ? posts.filter((post) => `${post.title} ${post.body} ${post.author} ${post.handle} ${post.community}`.toLowerCase().includes(q))
      : posts.slice(0, 2)
    const matchedCommunities = q
      ? communities.filter((community) =>
          `${community.name} ${community.channels.map((channel) => `${channel.name} ${channel.topic}`).join(' ')} ${community.members.map((member) => `${member.name} ${member.role}`).join(' ')}`
            .toLowerCase()
            .includes(q),
        )
      : communities.slice(0, 2)

    return (
      <main className={styles.workspaceContent}>
        <section className={`${styles.panelStack} ${styles.searchGrid}`}>
          {[
            { title: 'Privacy by default', copy: 'Search results respect visibility and data ownership.' },
            { title: 'Communities first', copy: 'Jump directly into the space that matches your query.' },
            { title: 'People and DMs', copy: 'Find the person or conversation you need faster.' },
          ].map((item) => (
            <article key={item.title} className={styles.infoCard}>
              <strong>{item.title}</strong>
              <p>{item.copy}</p>
            </article>
          ))}
        </section>

        <section className={`${styles.panelStack} ${styles.resultsCard}`}>
          <div className={styles.sectionHeadingRow}>
            <h2>{q ? 'Results' : 'Recent results'}</h2>
            <span>{matchedPosts.length + matchedCommunities.length} items</span>
          </div>
          {matchedPosts.length === 0 && matchedCommunities.length === 0 ? (
            <article className={styles.infoCard}>
              <strong>No results for “{searchQuery.trim()}”</strong>
              <p>Try a different keyword, or browse spaces and friends instead.</p>
              <div>
                <button type="button" className={styles.contentChip} onClick={() => onSearchQuery('')}>
                  Clear search
                </button>
              </div>
            </article>
          ) : (
            <div className={styles.resultList}>
              {matchedPosts.map((post) => (
                <article key={post.title} className={styles.resultRow}>
                  <div>
                    <strong>{post.title}</strong>
                    <p>{post.community ? `${post.community} · ` : ''}{post.author}</p>
                  </div>
                  <span>{post.stats.comments} comments</span>
                </article>
              ))}
              {matchedCommunities.map((community) => (
                <article key={community.name} className={styles.resultRow}>
                  <div>
                    <strong>{community.name}</strong>
                    <p>{community.channels.length} channels · {community.members.length} members</p>
                  </div>
                  <span>Community</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    )
  }

  if (mode === 'settings') {
    return (
      <main className={styles.workspaceContent}>
        <section className={`${styles.panelStack} ${styles.settingsGrid}`}>
          <article className={styles.settingsCard}>
            <Shield aria-hidden="true" />
            <div>
              <strong>Privacy</strong>
              <p>Control who can view your content, profile, and activity.</p>
            </div>
          </article>
          <article className={styles.settingsCard}>
            <MessageCircle aria-hidden="true" />
            <div>
              <strong>Notifications</strong>
              <p>Choose alerts for communities, friends, and direct messages.</p>
            </div>
          </article>
          <article className={styles.settingsCard}>
            <Users aria-hidden="true" />
            <div>
              <strong>Account</strong>
              <p>Manage login methods, sessions, and profile details.</p>
            </div>
          </article>
        </section>
      </main>
    )
  }

  if (mode === 'communities') {
    return (
      <main
        className={`${styles.workspaceContent} ${styles.communitiesLayout}`}
        style={{ '--community-color': activeCommunity.color } as CSSProperties}
      >
        <header className={styles.communityBar}>
          <div className={styles.communityBarCommunity}>
            <h2>{activeCommunity.name}</h2>
          </div>
          <div className={styles.communityBarMain}>
            <strong># {activeChannel.name}</strong>
            <span className={styles.postDivider}>·</span>
            <span className={styles.communityBarTopic}>{activeChannel.topic}</span>
            <div className={styles.communityBarActions}>
              {/* TEMPORARY: decorative until channel pins land. */}
              <button type="button" className={styles.dmBarAction} aria-label="Pinned messages (coming soon)">
                <Pin size={17} aria-hidden="true" />
              </button>
              {/* TEMPORARY: decorative until channel search lands. */}
              <label className={styles.dmBarSearch}>
                <Search size={15} aria-hidden="true" />
                <input type="search" placeholder="Search" aria-label="Search channel (coming soon)" />
              </label>
            </div>
          </div>
        </header>

        <div className={styles.communitiesBody}>
          <aside className={styles.channelPane} aria-label={`${activeCommunity.name} channels`}>
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
              openMenu={openMenu}
            />
          </div>
        </div>
      </main>
    )
  }

  const openPostMenu = (e: ReactMouseEvent<HTMLElement>, post: Post) => {
    e.preventDefault()
    // LOCAL-ONLY: slug is fabricated; no backend route exists for it yet.
    const postSlug = `${post.author}-${post.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    // Capture the highlight now — opening the menu collapses the selection.
    const selection = window.getSelection()?.toString().trim() ?? ''
    const items: ContextMenuItem[] = [
      ...(selection ? [{ icon: <Copy size={16} aria-hidden="true" />, label: 'Copy', hint: 'Ctrl + C', onSelect: () => void copyText(selection) }] : []),
      { icon: <Copy size={16} aria-hidden="true" />, label: 'Copy Text', onSelect: () => void copyText(post.body ? `${post.title}\n\n${post.body}` : post.title) },
      { icon: <MessageCircle size={16} aria-hidden="true" />, label: 'Open Thread', onSelect: () => onOpenThread(post) },
      { icon: <Link2 size={16} aria-hidden="true" />, label: 'Copy Post Link', onSelect: () => void copyText(`https://crowbit.net/p/${postSlug}`) },
    ]
    if (post.author === 'You') {
      items.push({ type: 'separator' })
      // LOCAL-ONLY: deletes from in-memory App state; nothing persists without a backend.
      items.push({
        icon: <Trash2 size={16} aria-hidden="true" />,
        label: 'Delete Post',
        danger: true,
        onSelect: () => onDeletePost(post),
      })
    }
    openMenu(e.clientX, e.clientY, items, e.currentTarget)
  }

  const visiblePosts =
    activeCommunityName === 'all'
      ? posts
      : activeCommunityName === 'home'
        ? posts.filter((post) => post.community === '' || joinedCommunityNames.has(post.community))
        : posts.filter((post) => post.community === activeCommunityName)

  return (
    <main className={styles.workspaceContent}>
      <section
        className={`${styles.panelStack} ${styles.feedStack} ${threadShift > 0 ? styles.threadShift : ''}`}
        style={threadShift > 0 ? ({ '--thread-shift': `${threadShift}px` } as CSSProperties) : undefined}
      >
        {visiblePosts.length === 0 ? (
          <article className={styles.infoCard}>
            <strong>No posts here yet</strong>
            <p>Nothing from {activeCommunityName === 'home' ? 'your spaces' : activeCommunityName} so far — try another space.</p>
          </article>
        ) : (
          visiblePosts.map((post) => (
          <article
            key={`${post.author}-${post.title}`}
            className={styles.postCard}
            onContextMenu={(e) => openPostMenu(e, post)}
          >
            <div className={styles.postHeader}>
              <div className={styles.avatar}>{post.author[0]}</div>
              <div className={styles.postMeta}>
                <div className={styles.postAuthorRow}>
                  <strong>{post.author}</strong>
                  <span className={styles.postHandle}>{post.handle}</span>
                  <span className={styles.postDivider}>•</span>
                  <span className={styles.postTime}>{post.time}</span>
                </div>
                {post.community && (
                  <div
                    className={styles.communityTag}
                    style={{
                      '--community-color': communities.find((community) => community.name === post.community)?.color,
                    } as CSSProperties}
                  >
                    <span>{post.community}</span>
                  </div>
                )}
              </div>
            </div>

            <h3>{post.title}</h3>
            {post.image && <img className={styles.postImage} src={post.image} alt="Placeholder post visual" />}
            {post.body && <p className={styles.postBody}>{post.body}</p>}

            <div className={styles.postStats}>
              <button type="button" className={styles.postAction} aria-label={`Upvote ${post.title}`}>
                <ArrowBigUp aria-hidden="true" />
                <span>{formatUpvotes(post.stats.upvotes)}</span>
              </button>
              <button type="button" className={styles.postAction} aria-label={`View comments for ${post.title}`} onClick={() => onOpenThread(post)}>
                <MessageCircle aria-hidden="true" />
                <span>{post.stats.comments}</span>
              </button>
              <button type="button" className={styles.postAction} aria-label={`Share ${post.title}`}>
                <Share2 aria-hidden="true" />
                <span>{post.stats.shares}</span>
              </button>
            </div>
          </article>
          ))
        )}
      </section>
    </main>
  )
}

export default WorkspaceContent
