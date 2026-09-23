import { Copy, Link2, Paperclip, Pencil, Pin, Reply, SendHorizontal, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react'
import type { CommunityChannel } from '../appData'
import { copyText } from '../lib/clipboard'
import type { ContextMenuItem } from './ContextMenu'
import styles from './ConversationView.module.css'

export type MessageEntry = {
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

export type ConversationMutuals = {
  communities: { name: string; background?: string }[]
  friends: string[]
}

type ConversationViewProps = {
  peerName: string
  initialMessages: MessageEntry[]
  mutuals?: ConversationMutuals
  metaOpen?: boolean
  edgeScrollbar?: boolean
  openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null) => void
}

// LOCAL-ONLY: fabricated per-channel threads until a backend exists.
export function buildChannelThread(
  channel: CommunityChannel,
  communityName: string,
  authors: string[],
): MessageEntry[] {
  const [first = 'Ari', second = 'Jun'] = authors
  const base = `${communityName}-${channel.id}`
  return [
    { id: `${base}-1`, author: first, time: 'Yesterday', body: `Kicking off #${channel.name} — ${channel.topic.charAt(0).toLowerCase()}${channel.topic.slice(1)}` },
    { id: `${base}-2`, author: second, time: 'Yesterday', body: 'Good timing, I was just looking at this. I will post my notes once they are cleaned up.' },
    { id: `${base}-3`, author: 'You', time: 'Yesterday', body: 'Same here — where should we keep the running decisions so they do not get buried?' },
    { id: `${base}-4`, author: first, time: 'Today', body: 'Pinned thread at the top works for now. I will summarize every Friday.', replyTo: { id: `${base}-3`, author: 'You', body: 'Same here — where should we keep the running decisions so they do not get buried?' } },
    { id: `${base}-5`, author: second, time: 'Today', body: 'Sounds good. I will send the revised version before the next check-in.' },
  ]
}

// Shortens quoted text with an explicit ellipsis (the CSS container
// truncation only kicks in when the full snippet overflows its box).
const snippet = (body: string, length = 80) => {
  const line = body.split('\n')[0] ?? ''
  return line.length > length ? `${line.slice(0, length).trimEnd()}…` : line
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

function ConversationView({
  peerName,
  initialMessages,
  mutuals,
  metaOpen = false,
  edgeScrollbar = false,
  openMenu,
}: ConversationViewProps) {
  const hasMutualCommunities = (mutuals?.communities.length ?? 0) > 0
  const hasMutualFriends = (mutuals?.friends.length ?? 0) > 0
  const [messages, setMessages] = useState<MessageEntry[]>(initialMessages)
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
  }, [draft])

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
    <div className={`${styles.conversationView} ${edgeScrollbar ? styles.edgeScrollbar : ''}`}>
      {(hasMutualCommunities || hasMutualFriends) && (
        <div className={`${styles.conversationMetaRow} ${metaOpen ? styles.open : ''}`}>
          <p className={styles.mutualStats}>
            {hasMutualCommunities && (
              <>
                <AvatarGroup items={mutuals!.communities} />
                <strong>{mutuals!.communities.length}</strong> mutual {mutuals!.communities.length === 1 ? 'community' : 'communities'}
              </>
            )}
            {hasMutualCommunities && hasMutualFriends && ' · '}
            {hasMutualFriends && (
              <>
                <AvatarGroup items={mutuals!.friends} />
                <strong>{mutuals!.friends.length}</strong> mutual {mutuals!.friends.length === 1 ? 'friend' : 'friends'}
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
            placeholder={`Message ${peerName}`}
            aria-label={`Message ${peerName}`}
            maxLength={2000}
          />
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={attach} tabIndex={-1} />
          <button
            type="submit"
            className={styles.composerSend}
            disabled={!draft.trim() && attachments.length === 0}
            aria-label={`Send message to ${peerName}`}
            title="Send"
          >
            <SendHorizontal size={16} aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ConversationView
