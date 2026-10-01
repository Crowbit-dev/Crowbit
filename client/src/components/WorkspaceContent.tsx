import { ArrowBigUp, AtSign, Ban, CheckCheck, ChevronDown, Copy, Ellipsis, Hash, Heart, Link2, MessageCircle, Phone, Pin, Reply, Search, Share2, Shield, Trash2, User, UserPlus, UserX, Users, Video, VolumeX } from 'lucide-react'
import { useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import type { Community, CommunityMember, DirectMessage, NotificationItem, Post, SearchFilter, SearchUser, WorkspaceMode } from '../types'
import { buildChannelThread, buildDmThread, mutualFriendsByDm, notifications } from '../appData'
import { copyText } from '../lib/clipboard'
import shared from '../styles/shared.module.css'
import type { ContextMenuItem } from './ContextMenu'
import ConversationView from './ConversationView'
import { notifFilterLabels } from '../lib/notifFilterLabels'
import { searchFilterLabels } from '../lib/searchFilterLabels'
import { matchCommunities, matchPosts, matchUsers } from '../lib/searchMatching'
import styles from './WorkspaceContent.module.css'

type WorkspaceContentProps = {
  mode: WorkspaceMode
  communities: Community[]
  posts: Post[]
  directMessages: DirectMessage[]
  activeCommunityName: string
  activeChannelId: string
  activeDmId: string
  feedScope: string
  notifFilter: 'all' | NotificationItem['kind']
  searchFilter: SearchFilter
  appliedSearchQuery: string
  onOpenChannel: (communityName: string, channelId: string) => void
  onOpenDm: (dmId: string) => void
  onOpenThread: (post: Post) => void
  onDeletePost: (post: Post) => void
  threadShift: number
  openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null, toggle?: boolean) => void
  searchQuery: string
  onSearchQuery: (query: string) => void
}

// TEMPORARY: formats mock counts until the backend provides real numbers.
const formatCount = (value: number) => {
  if (value < 1000) return `${value}`
  if (value < 1_000_000) return `${trimZeros(value / 1000)}k`
  return `${trimZeros(value / 1_000_000)}m`
}

const trimZeros = (value: number) => (Number.isInteger(value) ? `${value}` : value.toFixed(1))

function WorkspaceContent({
  mode,
  communities,
  posts,
  directMessages,
  activeCommunityName,
  activeChannelId,
  activeDmId,
  feedScope,
  notifFilter,
  searchFilter,
  appliedSearchQuery,
  onOpenChannel,
  onOpenDm,
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
  const [paneTab, setPaneTab] = useState<'channels' | 'members'>('channels')

  const openMemberMenu = (x: number, y: number, member: CommunityMember, invoker: HTMLElement | null, toggle = false) => {
    // LOCAL-ONLY: handle and id are derived from the mock name; a real backend would provide both.
    const handle = `@${member.name.toLowerCase()}`
    const id = member.name.toLowerCase()
    const items: ContextMenuItem[] = [
      { icon: <Copy size={16} aria-hidden="true" />, label: 'Copy Username', onSelect: () => void copyText(handle) },
      { icon: <Copy size={16} aria-hidden="true" />, label: 'Copy User ID', onSelect: () => void copyText(id) },
      // LOCAL-ONLY: fake link; no backend route exists for it yet.
      { icon: <Link2 size={16} aria-hidden="true" />, label: 'Copy Profile Link', onSelect: () => void copyText(`https://crowbit.net/u/${id}`) },
      { type: 'separator' },
      // TEMPORARY: decorative until DMs and profiles land.
      { icon: <MessageCircle size={16} aria-hidden="true" />, label: 'Message', onSelect: () => {} },
      { icon: <User size={16} aria-hidden="true" />, label: 'View Profile', onSelect: () => {} },
      { type: 'separator' },
      // TEMPORARY: decorative until moderation lands.
      { icon: <VolumeX size={16} aria-hidden="true" />, label: 'Mute', onSelect: () => {} },
      { icon: <UserX size={16} aria-hidden="true" />, label: 'Kick', danger: true, onSelect: () => {} },
      { icon: <Ban size={16} aria-hidden="true" />, label: 'Ban', danger: true, onSelect: () => {} },
    ]
    openMenu(x, y, items, invoker, toggle)
  }

  const openMemberMenuAtEvent = (e: ReactMouseEvent<HTMLElement>, member: CommunityMember, toggle = false) => {
    e.preventDefault()
    openMemberMenu(e.clientX, e.clientY, member, e.currentTarget, toggle)
  }

  if (mode === 'dms') {
    return (
      <main className={`${styles.workspaceContent} ${styles.dmLayout}`}>
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
            initialMessages={buildDmThread(activeDm.id, activeDm.name, activeDm.preview)}
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
    const q = searchQuery.trim().toLowerCase()
    const visibleItems = notifications.filter((item) =>
      (notifFilter === 'all' || item.kind === notifFilter) &&
      (!q || `${item.actor} ${item.community} ${item.channel} ${item.snippet}`.toLowerCase().includes(q)),
    )
    const openItem = (item: NotificationItem) => {
      if ((item.kind === 'like' || item.kind === 'comment') && item.postTitle) {
        const post = posts.find((entry) => entry.title === item.postTitle)
        if (post) {
          onOpenThread(post)
          return
        }
      }
      onOpenChannel(item.community, item.channel)
    }

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
              const color = communities.find((community) => community.name === item.community)?.color ?? '#533e52'
              if (item.kind === 'follow_request') {
                return (
                  <article key={item.id} className={styles.notifRow}>
                    <span className={styles.notifAvatar}>{item.actor[0]}</span>
                    <span className={styles.notifKind}>
                      <UserPlus size={14} aria-hidden="true" />
                    </span>
                    <span className={styles.notifCopy}>
                      <span className={styles.notifText}>
                        <strong>{item.actor}</strong>
                        {' requested to follow you'}
                      </span>
                      <span className={styles.notifMeta}>
                        <span className={shared.sidebarDot} style={{ background: color }} />
                        {item.community} · {item.time}
                      </span>
                      <span className={styles.notifFollowActions}>
                        {/* TEMPORARY: decorative until follow requests land. */}
                        <button type="button" className={styles.contentChip}>Accept</button>
                        <button type="button" className={styles.contentChip}>Decline</button>
                      </span>
                    </span>
                  </article>
                )
              }
              const kindIcon = item.kind === 'mention'
                ? <AtSign size={14} aria-hidden="true" />
                : item.kind === 'like'
                  ? <Heart size={14} aria-hidden="true" />
                  : item.kind === 'comment'
                    ? <MessageCircle size={14} aria-hidden="true" />
                    : <Reply size={14} aria-hidden="true" />
              const kindVerb = item.kind === 'mention'
                ? 'mentioned you'
                : item.kind === 'like'
                  ? 'liked your post'
                  : item.kind === 'comment'
                    ? 'commented on your post'
                    : 'replied to you'
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
                        <>in <strong>#{item.channel}</strong></>
                      )}
                    </span>
                    <span className={styles.notifSnippet}>{item.snippet}</span>
                    <span className={styles.notifMeta}>
                      <span className={shared.sidebarDot} style={{ background: color }} />
                      {item.community} · {item.time}
                    </span>
                  </span>
                </button>
              )
            })
          )}
        </section>
      </main>
    )
  }

  if (mode === 'search') {
    const q = appliedSearchQuery.trim().toLowerCase()
    const matchedPosts = searchFilter === 'user' || searchFilter === 'community' ? [] : matchPosts(posts, q)
    const matchedUsers = searchFilter === 'post' || searchFilter === 'community' ? [] : matchUsers(communities, directMessages, q)
    const matchedCommunities = searchFilter === 'post' || searchFilter === 'user' ? [] : matchCommunities(communities, q)
    const totalResults = matchedPosts.length + matchedUsers.length + matchedCommunities.length
    const statusLabel = (status: SearchUser['status']) => status === 'online' ? 'Online' : status === 'away' ? 'Idle' : 'Offline'
    const openUser = (user: SearchUser) => {
      if (user.dmId) {
        onOpenDm(user.dmId)
        return
      }
      const community = communities.find((entry) => entry.name === user.community)
      if (community) onOpenChannel(community.name, community.channels[0]?.id ?? 'general')
    }

    return (
      <main className={styles.workspaceContent}>
        <section className={`${styles.panelStack} ${styles.resultsCard}`}>
          <div className={styles.sectionHeadingRow}>
            <h2>{q ? 'Results' : 'Search'}{searchFilter !== 'all' && ` · ${searchFilterLabels[searchFilter]}`}</h2>
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
                <button type="button" className={styles.contentChip} onClick={() => onSearchQuery('')}>
                  Clear search
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.resultList}>
              {matchedPosts.map((post) => (
                <article key={post.title} className={styles.resultRow}>
                  <div>
                    <strong>{post.title}</strong>
                    <p>{post.community ? `${post.community} · ` : ''}{post.author}</p>
                  </div>
                  <span>{formatCount(post.stats.comments)} comments</span>
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
              {matchedUsers.map((user) => (
                <button
                  key={user.name}
                  type="button"
                  className={styles.notifRow}
                  onClick={() => openUser(user)}
                  aria-label={`${user.name} — ${user.detail}`}
                >
                  <span className={styles.notifAvatar}>{user.name[0]}</span>
                  <span className={styles.notifCopy}>
                    <span className={styles.notifText}>
                      <strong>{user.name}</strong>
                    </span>
                    <span className={styles.notifMeta}>
                      {user.detail} · {statusLabel(user.status)}
                    </span>
                  </span>
                </button>
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
          <button
            type="button"
            className={styles.communityBarCommunity}
            onClick={() => setPaneTab((prev) => (prev === 'channels' ? 'members' : 'channels'))}
            aria-expanded={paneTab === 'members'}
            aria-label={`${activeCommunity.name}: ${paneTab === 'channels' ? 'show members' : 'show channels'}`}
          >
            <span className={styles.communityBarPill}>
              <span className={styles.communityBarName}>{activeCommunity.name}</span>
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
          <aside className={styles.channelPane} aria-label={paneTab === 'channels' ? `${activeCommunity.name} channels` : `${activeCommunity.name} members`}>
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
            <div
              className={`${styles.memberOverlay} ${paneTab === 'members' ? styles.memberOverlayOpen : ''}`}
              aria-hidden={paneTab !== 'members'}
            >
              <div className={styles.memberOverlaySlide}>
              {activeCommunity.members.map((member) => (
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
    feedScope === 'all'
      ? posts
      : feedScope === 'home'
        ? posts.filter((post) => post.community === '' || joinedCommunityNames.has(post.community))
        : posts.filter((post) => post.community === feedScope)

  return (
    <main className={styles.workspaceContent}>
      <section
        className={`${styles.panelStack} ${styles.feedStack} ${threadShift > 0 ? styles.threadShift : ''}`}
        style={threadShift > 0 ? ({ '--thread-shift': `${threadShift}px` } as CSSProperties) : undefined}
      >
        {visiblePosts.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>No posts here yet</strong>
            <p>Nothing from {feedScope === 'home' ? 'your spaces' : feedScope} so far — try another space.</p>
          </div>
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
                <span>{formatCount(post.stats.upvotes)}</span>
              </button>
              <button type="button" className={styles.postAction} aria-label={`View comments for ${post.title}`} onClick={() => onOpenThread(post)}>
                <MessageCircle aria-hidden="true" />
                <span>{formatCount(post.stats.comments)}</span>
              </button>
              <button type="button" className={styles.postAction} aria-label={`Share ${post.title}`}>
                <Share2 aria-hidden="true" />
                <span>{formatCount(post.stats.shares)}</span>
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
