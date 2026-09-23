import { ArrowBigUp, Copy, Hash, Link2, MessageCircle, Paperclip, Pencil, Phone, Pin, Reply, Search, SendHorizontal, Share2, Shield, Trash2, UserPlus, Users, Video, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react'
import type { Community, DirectMessage, Post, WorkspaceMode } from '../appData'
import { copyText } from '../lib/clipboard'
import shared from '../styles/shared.module.css'
import type { ContextMenuItem } from './ContextMenu'
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

type MessageEntry = {
  // LOCAL-ONLY: mock ids so messages have stable keys/links with no backend.
  id: string
  author: string
  time: string
  body: string
  image?: string
  edited?: boolean
  // LOCAL-ONLY: quoted reference; a real backend would resolve this from an id.
  replyTo?: { id: string; author: string; body: string }
}

// TEMPORARY: formats mock upvote counts until the backend provides real numbers.
const formatUpvotes = (value: number) => (value < 100 ? `${value}` : `${value}k`)

// Shortens quoted text with an explicit ellipsis (the CSS container
// truncation only kicks in when the full snippet overflows its box).
const snippet = (body: string, length = 80) => {
  const line = body.split('\n')[0] ?? ''
  return line.length > length ? `${line.slice(0, length).trimEnd()}…` : line
}

const mutualFriendsByDm: Record<string, string[]> = {
  maya: ['Jules', 'Sami', 'Theo'],
  jules: ['Maya', 'Sami'],
  sami: ['Maya', 'Jules', 'Theo', 'Noor'],
  theo: ['Maya'],
}

const AVATAR_TONES = [
  'linear-gradient(135deg, #533e52, #6f5b6d)',
  'linear-gradient(135deg, #423341, #675566)',
  'linear-gradient(135deg, #515151, #313131)',
  'linear-gradient(135deg, #6f5b6d, #423341)',
]

type AvatarGroupItem = string | { name: string; background?: string }

function AvatarGroup({ items, max = 3 }: { items: AvatarGroupItem[]; max?: number }) {
  const normalized = items.map((item) => (typeof item === 'string' ? { name: item } : item))
  const visible = normalized.slice(0, max)
  const extra = normalized.length - visible.length
  if (normalized.length === 0) return null
  return (
    <span className={styles.avatarGroup}>
      {visible.map((item, index) => (
        <span
          key={item.name}
          className={styles.avatarGroupAvatar}
          style={{ background: item.background ?? AVATAR_TONES[item.name.charCodeAt(0) % AVATAR_TONES.length], zIndex: visible.length - index }}
          title={item.name}
        >
          {item.name[0]}
        </span>
      ))}
      {extra > 0 && <span className={`${styles.avatarGroupAvatar} ${styles.avatarGroupMore}`}>+{extra}</span>}
    </span>
  )
}

function DmConversation({
  activeDm,
  mutualCommunities,
  openMenu,
}: {
  activeDm: DirectMessage
  mutualCommunities: Community[]
  openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null) => void
}) {
  const mutualFriends = mutualFriendsByDm[activeDm.id] ?? []
  const hasMutualCommunities = mutualCommunities.length > 0
  const hasMutualFriends = mutualFriends.length > 0
  const [messages, setMessages] = useState<MessageEntry[]>([
    { id: `${activeDm.id}-1`, author: activeDm.name, time: 'Yesterday', body: activeDm.preview },
    { id: `${activeDm.id}-2`, author: 'You', time: 'Yesterday', body: 'I left feedback on the latest update and marked the next steps.' },
    { id: `${activeDm.id}-3`, author: activeDm.name, time: 'Today', body: 'I will send the revised version before the next check-in.' },
  ])
  const [draft, setDraft] = useState('')
  const [replyTarget, setReplyTarget] = useState<MessageEntry | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<{ url: string; name: string }[]>([])
  // LOCAL-ONLY: pinned ids live in memory; no backend persists them yet.
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const stuckToBottomRef = useRef(true)
  const flashTimer = useRef<number | null>(null)

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
    const scroller = feedRef.current
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
    const scroller = feedRef.current
    if (!scroller || !stuckToBottomRef.current) {
      return
    }
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'auto' })
  }, [messages])

  // Typing anywhere outside a field jumps into the composer.
  // Focusing during keydown lets the keystroke itself land in the box.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return
      const target = document.activeElement as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return
      if ((tag === 'BUTTON' || tag === 'A') && e.key === ' ') return
      if (document.activeElement !== inputRef.current) inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const send = () => {
    const body = draft.trim()
    if (!body && attachments.length === 0) return
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        author: 'You',
        time: 'Now',
        body: body || 'Shared an image',
        image: attachments[0]?.url,
        replyTo: replyTarget ? { id: replyTarget.id, author: replyTarget.author, body: replyTarget.body } : undefined,
      },
    ])
    attachments.slice(1).forEach((attachment) => URL.revokeObjectURL(attachment.url))
    setAttachments([])
    setDraft('')
    setReplyTarget(null)
    inputRef.current?.focus()
  }

  const attach = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((file) => file.type.startsWith('image/'))
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files.map((file) => ({ url: URL.createObjectURL(file), name: file.name }))])
    }
    e.target.value = ''
  }

  const removeAttachment = (url: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.url !== url))
    URL.revokeObjectURL(url)
  }

  const replyTo = (message: MessageEntry) => {
    setReplyTarget(message)
    inputRef.current?.focus()
  }

  const startEdit = (message: MessageEntry) => {
    setEditingId(message.id)
    setEditDraft(message.body)
  }

  const saveEdit = () => {
    const body = editDraft.trim()
    if (!editingId || !body) return
    // LOCAL-ONLY: edits apply to in-memory state; nothing persists without a backend.
    setMessages((prev) => prev.map((entry) => (entry.id === editingId ? { ...entry, body, edited: true } : entry)))
    setEditingId(null)
    setEditDraft('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft('')
  }

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const jumpToMessage = (id: string) => {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFlashId(id)
    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlashId(null), 1200)
  }

  const openMessageMenu = (e: ReactMouseEvent<HTMLElement>, message: MessageEntry) => {
    e.preventDefault()
    // Capture the highlight now — opening the menu collapses the selection.
    const selection = window.getSelection()?.toString().trim() ?? ''
    const items: ContextMenuItem[] = [
      ...(selection ? [{ icon: <Copy size={16} aria-hidden="true" />, label: 'Copy', hint: 'Ctrl + C', onSelect: () => void copyText(selection) }] : []),
      { icon: <Copy size={16} aria-hidden="true" />, label: 'Copy Text', onSelect: () => void copyText(message.body) },
      { icon: <Reply size={16} aria-hidden="true" />, label: 'Reply', onSelect: () => replyTo(message) },
      { icon: <Pin size={16} aria-hidden="true" />, label: pinnedIds.has(message.id) ? 'Unpin Message' : 'Pin Message', onSelect: () => togglePin(message.id) },
      // LOCAL-ONLY: fake link; no backend route exists for it yet.
      { icon: <Link2 size={16} aria-hidden="true" />, label: 'Copy Message Link', onSelect: () => void copyText(`https://crowbit.net/m/${message.id}`) },
    ]
    if (message.author === 'You') {
      items.unshift({ icon: <Pencil size={16} aria-hidden="true" />, label: 'Edit Message', onSelect: () => startEdit(message) })
      items.push({ type: 'separator' })
      // LOCAL-ONLY: deletes from in-memory state; nothing persists without a backend.
      items.push({
        icon: <Trash2 size={16} aria-hidden="true" />,
        label: 'Delete Message',
        danger: true,
        onSelect: () => {
          setMessages((prev) => prev.filter((entry) => entry.id !== message.id))
          setPinnedIds((prev) => {
            if (!prev.has(message.id)) return prev
            const next = new Set(prev)
            next.delete(message.id)
            return next
          })
        },
      })
    }
    openMenu(e.clientX, e.clientY, items, e.currentTarget)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    send()
  }

  return (
    <>
      {(hasMutualCommunities || hasMutualFriends) && (
        <div className={styles.conversationMetaRow}>
          <p className={styles.mutualStats}>
            {hasMutualCommunities && (
              <>
                <AvatarGroup items={mutualCommunities.map((community) => ({ name: community.name, background: community.color }))} />
                <strong>{mutualCommunities.length}</strong> mutual {mutualCommunities.length === 1 ? 'community' : 'communities'}
              </>
            )}
            {hasMutualCommunities && hasMutualFriends && ' · '}
            {hasMutualFriends && (
              <>
                <AvatarGroup items={mutualFriends} />
                <strong>{mutualFriends.length}</strong> mutual {mutualFriends.length === 1 ? 'friend' : 'friends'}
              </>
            )}
          </p>
        </div>
      )}

      <div ref={feedRef} className={styles.conversationFeed}>
          {messages.map((message) => (
              <article
                id={`msg-${message.id}`}
                key={message.id}
                className={`${styles.chatMessage} ${flashId === message.id ? styles.flash : ''} ${message.replyTo ? styles.hasReply : ''}`}
                onContextMenu={(e) => openMessageMenu(e, message)}
              >
                <div className={styles.messageAvatar}>{message.author[0]}</div>
                <div className={styles.chatMessageCopy}>
                  {message.replyTo && (
                    <button
                      type="button"
                      className={styles.messageReference}
                      onClick={() => message.replyTo && jumpToMessage(message.replyTo.id)}
                      aria-label={`Jump to ${message.replyTo.author}'s message`}
                    >
                      <Reply size={12} aria-hidden="true" />
                      <strong>{message.replyTo.author}</strong>
                      <span>{snippet(message.replyTo.body)}</span>
                    </button>
                  )}
                  <div className={styles.chatMessageTopline}>
                    <strong>{message.author}</strong>
                    <span>{message.time}</span>
                    {pinnedIds.has(message.id) && <span className={styles.pinnedMark} title="Pinned"><Pin size={12} aria-hidden="true" /></span>}
                  </div>
                  {editingId === message.id ? (
                    <div className={styles.messageEditor}>
                      <textarea
                        autoFocus
                        rows={2}
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            saveEdit()
                          } else if (e.key === 'Escape') {
                            e.stopPropagation()
                            cancelEdit()
                          }
                        }}
                        aria-label="Edit message"
                      />
                      <span>Enter to save · Esc to cancel</span>
                    </div>
                  ) : (
                    <p>{message.body}{message.edited && <span className={styles.editedMark}> (edited)</span>}</p>
                  )}
                  {message.image && <img className={styles.chatMessageImage} src={message.image} alt="Attached image" />}
            </div>
          </article>
        ))}
      </div>

      <form className={styles.messageComposer} onSubmit={handleSubmit}>
        {replyTarget && (
          <div className={styles.replyPreview}>
            <span className={styles.replyPreviewText}>
              Replying to <strong>{replyTarget.author}</strong>
            </span>
            <span className={styles.replyPreviewSnippet}>{snippet(replyTarget.body)}</span>
            <button type="button" className={styles.replyPreviewClose} onClick={() => setReplyTarget(null)} aria-label="Cancel reply" title="Cancel reply">
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}
        {attachments.length > 0 && (
          <div className={styles.dmAttachments}>
            {attachments.map((attachment) => (
              <span key={attachment.url} className={styles.dmAttachment}>
                <img src={attachment.url} alt={attachment.name} />
                <button type="button" onClick={() => removeAttachment(attachment.url)} aria-label={`Remove ${attachment.name}`} title="Remove">
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className={styles.messageComposerRow}>
          <button
            type="button"
            className={styles.composerSend}
            onClick={() => fileRef.current?.click()}
            aria-label="Attach images"
            title="Attach images"
          >
            <Paperclip size={16} aria-hidden="true" />
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              } else if (e.key === 'Escape') {
                setReplyTarget(null)
              }
            }}
            placeholder={`Message ${activeDm.name}`}
            aria-label={`Message ${activeDm.name}`}
            maxLength={2000}
          />
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={attach} tabIndex={-1} />
          <button
            type="submit"
            className={styles.composerSend}
            disabled={!draft.trim() && attachments.length === 0}
            aria-label={`Send message to ${activeDm.name}`}
            title="Send"
          >
            <SendHorizontal size={16} aria-hidden="true" />
          </button>
        </div>
      </form>
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

  if (mode === 'dms') {
    return (
      <main className={styles.workspaceContent}>
        <header className={styles.dmBar}>
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
          <DmConversation key={activeDm.id} activeDm={activeDm} mutualCommunities={mutualCommunities} openMenu={openMenu} />
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
          <h2>{activeCommunity.name}</h2>
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
