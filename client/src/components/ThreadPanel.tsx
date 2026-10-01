import { Copy, Link2, Pencil, Reply, SendHorizontal, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { mockComments } from '../appData'
import { copyText } from '../lib/clipboard'
import { formatCount } from '../lib/formatCount'
import type { Post, ThreadComment } from '../types'
import type { ContextMenuItem } from './ContextMenu'
import styles from './ThreadPanel.module.css'

function ThreadPanel({ post, onClose, width, maxWidth, onResizeWidth, openMenu }: { post: Post; onClose: () => void; width: number; maxWidth: number; onResizeWidth: (width: number) => void; openMenu: (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null, toggle?: boolean) => void }) {
  const [comments, setComments] = useState<ThreadComment[]>(() => mockComments[post.title] ?? [])
  const [draft, setDraft] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [dragging, setDragging] = useState(false)
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const stuckToBottomRef = useRef(true)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    const ta = inputRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const fullHeight = ta.scrollHeight
    const cappedHeight = Math.min(fullHeight, 140)
    ta.style.height = `${cappedHeight}px`
    ta.style.overflowY = fullHeight > cappedHeight ? 'auto' : 'hidden'
  }, [draft])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const onScroll = () => {
      stuckToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (el && stuckToBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'auto' })
    }
  }, [comments])

  const send = () => {
    const body = draft.trim()
    if (!body) return
    setComments((prev) => [...prev, { author: 'You', time: 'Now', body }]) // change author to current user when backend is ready
    setDraft('')
    inputRef.current?.focus()
  }

  const replyToComment = (comment: ThreadComment) => {
    setDraft(`@${comment.author} `)
    inputRef.current?.focus()
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditDraft(comments[index]?.body ?? '')
  }

  const saveEdit = () => {
    const body = editDraft.trim()
    if (editingIndex === null || !body) return
    setComments((prev) => prev.map((entry, index) => (index === editingIndex ? { ...entry, body, edited: true } : entry)))
    setEditingIndex(null)
    setEditDraft('')
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditDraft('')
  }

  const openCommentMenu = (e: ReactMouseEvent<HTMLElement>, comment: ThreadComment, index: number) => {
    e.preventDefault()
    const selection = window.getSelection()?.toString().trim() ?? ''
    const items: ContextMenuItem[] = [
      ...(selection ? [{ icon: <Copy size={16} aria-hidden="true" />, label: 'Copy', hint: 'Ctrl + C', onSelect: () => void copyText(selection) }] : []),
      { icon: <Copy size={16} aria-hidden="true" />, label: 'Copy Text', onSelect: () => void copyText(comment.body) },
      { icon: <Link2 size={16} aria-hidden="true" />, label: 'Copy Comment Link', onSelect: () => void copyText(`https://crowbit.net/c/${post.title}/${index}`) },
      { type: 'separator' },
      { icon: <Reply size={16} aria-hidden="true" />, label: 'Reply', onSelect: () => replyToComment(comment) },
      ...(comment.author === 'You'
        ? [{ icon: <Pencil size={16} aria-hidden="true" />, label: 'Edit Comment', onSelect: () => startEdit(index) }]
        : []),
    ]
    if (comment.author === 'You') {
      items.push({ type: 'separator' })
      items.push({
        icon: <Trash2 size={16} aria-hidden="true" />,
        label: 'Delete Comment',
        danger: true,
        onSelect: () => {
          if (editingIndex === index) cancelEdit()
          setComments((prev) => prev.filter((_, entryIndex) => entryIndex !== index))
        },
      })
    }
    openMenu(e.clientX, e.clientY, items, e.currentTarget)
  }

  const clampWidth = (value: number) => Math.round(Math.min(maxWidth, Math.max(280, value)))

  return (
    <aside className={styles.thread} aria-label={`Comments on ${post.title}`}>
      <div
        className={`${styles.resizeHandle} ${dragging ? styles.dragging : ''}`}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize thread panel"
        aria-valuenow={width}
        aria-valuemin={280}
        aria-valuemax={maxWidth}
        tabIndex={0}
        onDoubleClick={() => onResizeWidth(clampWidth(400))}
        onPointerDown={(e) => {
          dragState.current = { startX: e.clientX, startWidth: width }
          setDragging(true)
          document.body.style.userSelect = 'none'
          const onMove = (ev: PointerEvent) => {
            const drag = dragState.current
            if (!drag) return
            onResizeWidth(clampWidth(drag.startWidth + (drag.startX - ev.clientX)))
          }
          const onEnd = () => {
            dragState.current = null
            setDragging(false)
            document.body.style.userSelect = ''
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onEnd)
            window.removeEventListener('pointercancel', onEnd)
          }
          window.addEventListener('pointermove', onMove)
          window.addEventListener('pointerup', onEnd)
          window.addEventListener('pointercancel', onEnd)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') onResizeWidth(clampWidth(width + 16))
          else if (e.key === 'ArrowRight') onResizeWidth(clampWidth(width - 16))
        }}
      />
      <div className={styles.header}>
        <div className={styles.heading}>
          <strong className={styles.title}>{post.title}</strong>
          {post.body && <p className={styles.body}>{post.body}</p>}
          {/* TEMPORARY: meta items show link affordance until click-through lands. */}
          <span className={styles.meta}>
            <span className={styles.metaItem}>{post.handle}</span>
            {' · '}
            <span className={styles.metaItem}>{post.community || 'Profile'}</span>
          </span>
          <span className={styles.stats}>{formatCount(post.stats.upvotes)} upvotes · {formatCount(post.stats.comments + comments.length)} comments · {formatCount(post.stats.shares)} shares</span>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close thread" title="Close thread">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div ref={listRef} className={styles.list}>
        {comments.length === 0 ? (
          <div className={styles.empty}>
            <strong>No comments yet</strong>
            <p>Start the conversation below.</p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <article
              key={`${comment.author}-${comment.time}-${index}`}
              className={styles.comment}
              onContextMenu={(e) => openCommentMenu(e, comment, index)}
            >
              {/* TEMPORARY: avatar and author show link affordance until click-through lands. */}
              <div className={styles.commentAvatar}>{comment.author[0]}</div>
              <div className={styles.commentCopy}>
                <div className={styles.commentTopline}>
                  <strong>{comment.author}</strong>
                  <span>{comment.time}</span>
                </div>
                {editingIndex === index ? (
                  <div className={styles.commentEditor}>
                    <textarea
                      ref={(el) => {
                        el?.focus()
                        el?.setSelectionRange(el.value.length, el.value.length)
                      }}
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
                      aria-label="Edit comment"
                    />
                    <span>Enter to save · Esc to cancel</span>
                  </div>
                ) : (
                  <p>{comment.body}{comment.edited && <span className={styles.editedMark}> (edited)</span>}</p>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <form
        className={styles.reply}
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
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
          placeholder="Reply..."
          aria-label={`Reply to ${post.title}`}
          maxLength={2000}
        />
        <button
          type="submit"
          className={styles.send}
          disabled={!draft.trim()}
          aria-label="Send reply"
          title="Send"
        >
          <SendHorizontal size={16} aria-hidden="true" />
        </button>
      </form>
    </aside>
  )
}

export default ThreadPanel
