import { Bell, HeadphoneOff, Headphones, Layers3, LogOut, Menu, MessageCircle, Mic, MicOff, Plus, Search, Settings } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WorkspaceMode } from '../appData'
import styles from './WorkspaceRail.module.css'

type RailItem = {
  mode: WorkspaceMode
  label: string
  icon: ReactNode
}

type WorkspaceRailProps = {
  mode: WorkspaceMode
  totalUnread: number
  onChangeMode: (nextMode: WorkspaceMode) => void
  onCompose: () => void
}

function WorkspaceRail({ mode, totalUnread, onChangeMode, onCompose }: WorkspaceRailProps) {
  const [muted, setMuted] = useState(false)
  const [deafened, setDeafened] = useState(false)
  const navigate = useNavigate()
  // Deafening implies mute, like Discord: undeafening restores the prior mic state.
  const micMuted = muted || deafened

  // TEMPORARY: mock current user until the backend provides session data.
  const currentUser = { displayName: 'Nova', username: '@nova' }
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
    },
    [],
  )

  const copyUsername = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.username)
    } catch {
      const fallback = document.createElement('textarea')
      fallback.value = currentUser.username
      document.body.appendChild(fallback)
      fallback.select()
      document.execCommand('copy')
      fallback.remove()
    }
    setCopied(true)
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  // TEMPORARY: client-side only until logout is wired to the backend.
  const logout = () => navigate('/login')

  const railItems: RailItem[] = [
    { mode: 'feed', label: 'Feed', icon: <Menu aria-hidden="true" /> },
    { mode: 'dms', label: 'Direct messages', icon: <MessageCircle aria-hidden="true" /> },
    { mode: 'communities', label: 'Communities', icon: <Layers3 aria-hidden="true" /> },
    { mode: 'notifications', label: 'Notifications', icon: <Bell aria-hidden="true" /> },
    { mode: 'search', label: 'Search', icon: <Search aria-hidden="true" /> },
    { mode: 'settings', label: 'Settings', icon: <Settings aria-hidden="true" /> },
  ]

  return (
    <aside className={styles.workspaceRail} aria-label="Primary navigation">
      <div className={styles.workspaceRailTop}>
        {railItems.map((item) => (
          <button
            key={item.mode}
            type="button"
            className={`${styles.railButton} ${mode === item.mode ? styles.active : ''}`}
            onClick={() => onChangeMode(item.mode)}
            aria-label={item.label}
            title={item.label}
          >
            {item.icon}
            {item.mode === 'notifications' && totalUnread > 0 && (
              <span className={styles.railBadge} aria-hidden="true">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </button>
        ))}
        <span className={styles.railDivider} aria-hidden="true" />
        <button type="button" className={styles.railButton} onClick={onCompose} aria-label="Compose new post" title="Compose new post">
          <Plus aria-hidden="true" />
        </button>
      </div>

      <div className={styles.workspaceRailBottom}>
        <button
          type="button"
          className={`${styles.railButton} ${micMuted ? styles.toggled : ''}`}
          onClick={() => setMuted((prev) => !prev)}
          disabled={deafened}
          aria-label={deafened ? 'Undeafen to unmute' : muted ? 'Unmute microphone' : 'Mute microphone'}
          aria-pressed={micMuted}
          title={deafened ? 'Undeafen to unmute' : muted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {micMuted ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
        </button>
        <button
          type="button"
          className={`${styles.railButton} ${deafened ? styles.toggled : ''}`}
          onClick={() => setDeafened((prev) => !prev)}
          aria-label={deafened ? 'Undeafen audio' : 'Deafen audio'}
          aria-pressed={deafened}
          title={deafened ? 'Undeafen audio' : 'Deafen audio'}
        >
          {deafened ? <HeadphoneOff aria-hidden="true" /> : <Headphones aria-hidden="true" />}
        </button>
        <div className={styles.profileWrap}>
          <button type="button" className={styles.railProfile} aria-label="Current user profile" title="Current user profile">
            <span className={styles.railAvatar}>N</span>
          </button>
          <div className={styles.profileCard}>
            <span className={styles.profileAvatar}>N</span>
            <span className={styles.profileDetails}>
              <span className={styles.profileCopy}>
                <strong>{currentUser.displayName}</strong>
                <button
                  type="button"
                  className={`${styles.profileCopyName} ${copied ? styles.copied : ''}`}
                  onClick={(e) => {
                    copyUsername()
                    e.currentTarget.blur()
                  }}
                  title="Copy username"
                >
                  {copied ? 'Copied!' : currentUser.username}
                </button>
              </span>
              <button type="button" className={styles.profileLogout} onClick={logout} aria-label="Log out" title="Log out">
                <LogOut size={16} aria-hidden="true" />
              </button>
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default WorkspaceRail
