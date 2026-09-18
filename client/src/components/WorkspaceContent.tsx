import { ArrowBigUp, MessageCircle, PenLine, Phone, Search, SendHorizontal, Share2, Shield, Users, Video } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import type { Community, DirectMessage, Post, WorkspaceMode } from '../appData'
import shared from '../styles/shared.module.css'
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
  searchQuery: string
  onSearchQuery: (query: string) => void
}

type MessageEntry = {
  author: string
  time: string
  body: string
}

// TEMPORARY: formats mock upvote counts until the backend provides real numbers.
const formatUpvotes = (value: number) => (value < 100 ? `${value}` : `${value}k`)

const mutualFriendsByDm: Record<string, string[]> = {
  maya: ['Jules', 'Sami', 'Theo'],
  jules: ['Maya', 'Sami'],
  sami: ['Maya', 'Jules', 'Theo', 'Noor'],
  theo: ['Maya'],
}

function DmConversation({ activeDm, mutualCommunities }: { activeDm: DirectMessage; mutualCommunities: Community[] }) {
  const mutualFriends = mutualFriendsByDm[activeDm.id] ?? []
  const [messages, setMessages] = useState<MessageEntry[]>([
    { author: activeDm.name, time: 'Yesterday', body: activeDm.preview },
    { author: 'You', time: 'Yesterday', body: 'I left feedback on the latest update and marked the next steps.' },
    { author: activeDm.name, time: 'Today', body: 'I will send the revised version before the next check-in.' },
  ])
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const stuckToBottomRef = useRef(true)

  useEffect(() => {
    const ta = inputRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const fullHeight = ta.scrollHeight
    const cappedHeight = Math.min(fullHeight, 140)
    ta.style.height = `${cappedHeight}px`
    ta.style.overflowY = fullHeight > cappedHeight ? 'auto' : 'hidden'
  }, [draft, activeDm.id])

  // Within 40px of the bottom counts as "at bottom" so rounding never breaks stickiness.
  useEffect(() => {
    const scroller = bottomRef.current?.closest('main')
    if (!scroller) return
    const onScroll = () => {
      stuckToBottomRef.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 40
    }
    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  // Autoscroll on new messages, but only if already at the bottom.
  useEffect(() => {
    const scroller = bottomRef.current?.closest('main')
    if (!scroller || !stuckToBottomRef.current) {
      return
    }
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'auto' })
  }, [messages])

  const send = () => {
    const body = draft.trim()
    if (!body) return
    setMessages((prev) => [...prev, { author: 'You', time: 'Now', body }])
    setDraft('')
    inputRef.current?.focus()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    send()
  }

  return (
    <>
          <div className={styles.conversationMetaRow}>
            <div className={styles.miniStatCard}>
          <strong>{mutualCommunities.length}</strong>
          <span>mutual {mutualCommunities.length === 1 ? 'community' : 'communities'}</span>
        </div>
        <div className={styles.miniStatCard}>
          <strong>{mutualFriends.length}</strong>
          <span>mutual {mutualFriends.length === 1 ? 'friend' : 'friends'}</span>
        </div>
      </div>

      <div className={styles.conversationFeed}>
        {messages.map((message, index) => (
          <article key={`${message.author}-${message.time}-${index}`} className={styles.chatMessage}>
            <div className={styles.messageAvatar}>{message.author[0]}</div>
            <div className={styles.chatMessageCopy}>
              <div className={styles.chatMessageTopline}>
                <strong>{message.author}</strong>
                <span>{message.time}</span>
              </div>
              <p>{message.body}</p>
            </div>
          </article>
        ))}
      </div>

      <form className={styles.messageComposer} onSubmit={handleSubmit}>
        <PenLine size={16} aria-hidden="true" />
        <textarea
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder={`Message ${activeDm.name}`}
          aria-label={`Message ${activeDm.name}`}
          maxLength={2000}
        />
        <button
          type="submit"
          className={styles.composerSend}
          disabled={!draft.trim()}
          aria-label={`Send message to ${activeDm.name}`}
          title="Send"
        >
          <SendHorizontal size={16} aria-hidden="true" />
        </button>
      </form>
      <div ref={bottomRef} aria-hidden="true" />
    </>
  )
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

  if (mode === 'dms') {
    return (
      <main className={styles.workspaceContent}>
        <section className={`${styles.contentHero} ${styles.dmHero}`}>
          <div>
            <p className={styles.contentKicker}>Direct messages</p>
            <h2>{activeDm.name}</h2>
            <p className={styles.contentSubcopy}>{activeDm.role} · {activeDm.status}</p>
          </div>
          <div className={styles.contentChipRow}>
            <button type="button" className={styles.contentChip} aria-label="Start voice call">
              <Phone size={16} aria-hidden="true" />
              Call
            </button>
            <button type="button" className={styles.contentChip} aria-label="Start video call">
              <Video size={16} aria-hidden="true" />
              Video call
            </button>
          </div>
        </section>

        <section className={`${styles.panelStack} ${styles.conversationPanel}`}>
          <DmConversation key={activeDm.id} activeDm={activeDm} mutualCommunities={mutualCommunities} />
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
        <section className={`${styles.contentHero} ${styles.notificationsHero}`}>
          <div>
            <p className={styles.contentKicker}>Notifications</p>
            <h2>Activity</h2>
            <p className={styles.contentSubcopy}>Unread messages across your communities, newest first.</p>
          </div>
          <div className={styles.contentChipRow}>
            <span className={styles.contentChip}>{totalUnread} unread</span>
            <span className={styles.contentChip}>{unreadChannels.length} channels</span>
          </div>
        </section>

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
        <section className={`${styles.contentHero} ${styles.searchHero}`}>
          <div>
            <p className={styles.contentKicker}>Search</p>
            <h1>Find posts, people, and spaces</h1>
            <p className={styles.contentSubcopy}>Search in one place without changing screens.</p>
          </div>
          <div className={styles.searchHeroCard}>
            <Search aria-hidden="true" />
            <span>{q ? `Results for “${searchQuery.trim()}”` : 'Search the network'}</span>
          </div>
        </section>

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
        <section className={`${styles.contentHero} ${styles.settingsHero}`}>
          <div>
            <p className={styles.contentKicker}>Settings</p>
            <h2>Privacy, notifications, and appearance</h2>
            <p className={styles.contentSubcopy}>Tune the app around how public or private you want to be.</p>
          </div>
        </section>

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
      <main className={styles.workspaceContent}>
        <section className={`${styles.contentHero} ${styles.communityHero}`}>
          <div>
            <p className={styles.contentKicker}>Communities</p>
            <h2>{activeCommunity.name}</h2>
            <p className={styles.contentSubcopy}>
              {activeCommunity.channels.length} channels · {activeCommunity.members.length} members
            </p>
          </div>
          <div className={styles.communityFocusCard}>
            <p className={styles.contentKicker}>Focused channel</p>
            <strong>#{activeChannel.name}</strong>
            <span>{activeChannel.topic}</span>
          </div>
        </section>

        <section className={`${styles.panelStack} ${styles.communityGrid}`}>
          <article className={styles.communityDetailCard}>
            <div className={styles.sectionHeadingRow}>
              <h2>Channels</h2>
              <span>Active</span>
            </div>
            <div className={styles.channelGrid}>
              {activeCommunity.channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`${styles.channelCard} ${activeChannel.id === channel.id ? styles.active : ''}`}
                  style={{ '--community-color': activeCommunity.color } as CSSProperties}
                >
                  <strong>#{channel.name}</strong>
                  <p>{channel.topic}</p>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.communityDetailCard}>
            <div className={styles.sectionHeadingRow}>
              <h2>Members</h2>
              <span>Online first</span>
            </div>
            <div className={styles.memberGrid}>
              {activeCommunity.members.map((member) => (
                <div key={member.name} className={styles.memberRow}>
                  <div className={`${shared.statusDot} ${shared[member.status]}`} />
                  <div>
                    <strong>{member.name}</strong>
                    <p>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.communityDetailCard}>
            <div className={styles.sectionHeadingRow}>
              <h2>Recent posts</h2>
              <span>From the feed</span>
            </div>
            <div className={styles.resultList}>
              {posts
                .filter((post) => post.community === activeCommunity.name)
                .slice(0, 2)
                .map((post) => (
                  <div key={post.title} className={styles.resultRow}>
                    <div>
                      <strong>{post.title}</strong>
                      <p>{post.author}</p>
                    </div>
                    <span>{formatUpvotes(post.stats.upvotes)} upvotes</span>
                  </div>
                ))}
            </div>
          </article>
        </section>
      </main>
    )
  }

  const visiblePosts =
    activeCommunityName === 'all'
      ? posts
      : activeCommunityName === 'home'
        ? posts.filter((post) => post.community === '' || joinedCommunityNames.has(post.community))
        : posts.filter((post) => post.community === activeCommunityName)

  const feedHighlights = [
    { value: `${visiblePosts.length}`, label: 'new posts' },
    { value: `${communities.length}`, label: 'communities' },
    { value: `${directMessages.filter((message) => message.status === 'online').length}`, label: 'friends online' },
  ]

  return (
    <main className={styles.workspaceContent}>
      <section className={`${styles.contentHero} ${styles.feedHero}`}>
        <div>
          <p className={styles.contentKicker}>Feed</p>
          <h2>What’s happening now</h2>
          <p className={styles.contentSubcopy}>A fast stream of posts, ideas, and activity across the network.</p>
        </div>
        <div className={styles.feedStatRow}>
          {feedHighlights.map((item) => (
            <div key={item.label} className={styles.miniStatCard}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.panelStack} ${styles.feedStack}`}>
        {visiblePosts.length === 0 ? (
          <article className={styles.infoCard}>
            <strong>No posts here yet</strong>
            <p>Nothing from {activeCommunityName === 'home' ? 'your spaces' : activeCommunityName} so far — try another space.</p>
          </article>
        ) : (
          visiblePosts.map((post) => (
          <article key={`${post.author}-${post.title}`} className={styles.postCard}>
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
              <button type="button" className={styles.postAction} aria-label={`View comments for ${post.title}`}>
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
