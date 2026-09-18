import { AlignLeft, Check, ChevronDown, Paperclip, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import type { Community, Post } from '../appData'
import styles from './PostModal.module.css'

const MAIN_LIMIT = 280
const RING_RADIUS = 9
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

type PostModalProps = {
  communities: Community[]
  defaultCommunity: string
  onClose: () => void
  onPost: (post: Post) => void
}

function PostModal({ communities, defaultCommunity, onClose, onPost }: PostModalProps) {
  const [text, setText] = useState('')
  const [body, setBody] = useState('')
  const [bodyOpen, setBodyOpen] = useState(false)
  const [community, setCommunity] = useState(defaultCommunity)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [attachments, setAttachments] = useState<{ url: string; name: string }[]>([])
  const mainRef = useRef<HTMLTextAreaElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedCommunity = communities.find((entry) => entry.name === community) ?? communities[0]
  const postingToProfile = community === ''

  // Close the picker on Escape, the modal on a second press.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (pickerOpen) setPickerOpen(false)
      else onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, pickerOpen])

  useEffect(() => {
    const ta = mainRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const fullHeight = ta.scrollHeight
    const cappedHeight = Math.min(fullHeight, 200)
    ta.style.height = `${cappedHeight}px`
    ta.style.overflowY = fullHeight > cappedHeight ? 'auto' : 'hidden'
  }, [text])

  useEffect(() => {
    const ta = bodyRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const fullHeight = ta.scrollHeight
    const cappedHeight = Math.min(fullHeight, 320)
    ta.style.height = `${cappedHeight}px`
    ta.style.overflowY = fullHeight > cappedHeight ? 'auto' : 'hidden'
  }, [body, bodyOpen])

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

  const toggleBody = () => {
    if (bodyOpen) setBody('')
    setBodyOpen((prev) => !prev)
  }

  const remaining = MAIN_LIMIT - text.length
  const ringFraction = Math.min(text.length / MAIN_LIMIT, 1)
  const canPost = text.trim().length > 0 || body.trim().length > 0

  const post = () => {
    const mainText = text.trim()
    const bodyText = body.trim()
    if (!mainText && !bodyText) return
    const resolvedTitle = mainText.slice(0, 80) || bodyText.split('\n').map((line) => line.trim()).find(Boolean)?.slice(0, 80) || 'Untitled'
    onPost({
      author: 'You',
      handle: '@you',
      time: 'Now',
      community,
      title: resolvedTitle,
      body: bodyText,
      image: attachments[0]?.url,
      stats: { comments: 0, upvotes: 0, shares: 0 },
    })
    attachments.slice(1).forEach((attachment) => URL.revokeObjectURL(attachment.url))
    onClose()
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Create post">
        <div className={styles.header}>
          <div className={styles.authorRow}>
            <div className={styles.avatar}>N</div>
            <div className={styles.authorCopy}>
              <strong>New post</strong>
              <span>Visible to the whole network</span>
            </div>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close composer" title="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div
          className={styles.picker}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setPickerOpen(false)
          }}
        >
          <button
            type="button"
            className={styles.pickerButton}
            onClick={() => setPickerOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            aria-label="Community to post to"
          >
            {postingToProfile ? (
              <span className={styles.pickerAvatar}>N</span>
            ) : (
              <span className={styles.pickerDot} style={{ background: selectedCommunity.color }} />
            )}
            {postingToProfile ? 'Profile' : selectedCommunity.name}
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {pickerOpen && (
            <div className={styles.pickerList} role="listbox" aria-label="Where to post">
              <button
                type="button"
                role="option"
                aria-selected={community === ''}
                className={`${styles.pickerOption} ${community === '' ? styles.pickerSelected : ''}`}
                onClick={() => {
                  setCommunity('')
                  setPickerOpen(false)
                }}
              >
                <span className={styles.pickerAvatar}>N</span>
                <span className={styles.pickerCopy}>
                  <strong>Profile</strong>
                  <span>Just you, no community</span>
                </span>
                {community === '' && <Check size={16} aria-hidden="true" />}
              </button>
              {communities.map((entry) => (
                <button
                  key={entry.name}
                  type="button"
                  role="option"
                  aria-selected={entry.name === community}
                  className={`${styles.pickerOption} ${entry.name === community ? styles.pickerSelected : ''}`}
                  onClick={() => {
                    setCommunity(entry.name)
                    setPickerOpen(false)
                  }}
                >
                  <span className={styles.pickerDot} style={{ background: entry.color }} />
                  <span className={styles.pickerCopy}>
                    <strong>{entry.name}</strong>
                    <span>{entry.members.length} members</span>
                  </span>
                  {entry.name === community && <Check size={16} aria-hidden="true" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea
          ref={mainRef}
          className={styles.main}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's happening?"
          aria-label="Post text"
          rows={2}
          maxLength={MAIN_LIMIT}
          autoFocus
        />

        {bodyOpen && (
          <textarea
            ref={bodyRef}
            className={styles.body}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a longer body... (optional)"
            aria-label="Post body (optional)"
            maxLength={2000}
          />
        )}

        {attachments.length > 0 && (
          <div className={styles.attachments}>
            {attachments.map((attachment) => (
              <span key={attachment.url} className={styles.attachment}>
                <img src={attachment.url} alt={attachment.name} />
                <button type="button" onClick={() => removeAttachment(attachment.url)} aria-label={`Remove ${attachment.name}`} title="Remove">
                  <X size={14} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <button
              type="button"
              className={styles.attach}
              onClick={() => fileRef.current?.click()}
              aria-label="Attach images"
              title="Attach images"
            >
              <Paperclip size={16} aria-hidden="true" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={attach} tabIndex={-1} />
            <button
              type="button"
              className={styles.bodyToggle}
              onClick={toggleBody}
              aria-expanded={bodyOpen}
              title={bodyOpen ? 'Remove body' : 'Add a full body'}
            >
              <AlignLeft size={16} aria-hidden="true" />
              {bodyOpen ? 'Remove body' : 'Add body'}
            </button>
          </div>
          <div className={styles.footerRight}>
            <span className={styles.ringWrap} role="img" aria-label={`${remaining} characters remaining`}>
              <svg width="24" height="24" viewBox="0 0 24 24" className={styles.ring} aria-hidden="true">
                <circle cx="12" cy="12" r={RING_RADIUS} className={styles.ringTrack} />
                <circle
                  cx="12"
                  cy="12"
                  r={RING_RADIUS}
                  className={`${styles.ringProgress} ${remaining <= 20 ? styles.ringLow : ''}`}
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - ringFraction)}
                />
              </svg>
            </span>
            <button type="button" className={styles.post} onClick={post} disabled={!canPost}>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostModal
