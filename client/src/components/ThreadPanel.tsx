import { SendHorizontal, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { mockComments } from '../appData'
import type { Post, ThreadComment } from '../types'
import styles from './ThreadPanel.module.css'

function ThreadPanel({ post, onClose, width, maxWidth, onResizeWidth }: { post: Post; onClose: () => void; width: number; maxWidth: number; onResizeWidth: (width: number) => void }) {
  const [comments, setComments] = useState<ThreadComment[]>(() => mockComments[post.title] ?? [])
  const [draft, setDraft] = useState('')
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
          <span className={styles.meta}>{post.author} · {post.community || 'Profile'} · {post.stats.comments + comments.length} comments</span>
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
            <article key={`${comment.author}-${comment.time}-${index}`} className={styles.comment}>
              <div className={styles.commentAvatar}>{comment.author[0]}</div>
              <div className={styles.commentCopy}>
                <div className={styles.commentTopline}>
                  <strong>{comment.author}</strong>
                  <span>{comment.time}</span>
                </div>
                <p>{comment.body}</p>
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
