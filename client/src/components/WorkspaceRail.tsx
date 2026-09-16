import { Bell, HeadphoneOff, Headphones, Layers3, Menu, MessageCircle, Mic, MicOff, Plus, Search, Settings } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { WorkspaceMode } from '../appData'

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

  const railItems: RailItem[] = [
    { mode: 'feed', label: 'Feed', icon: <Menu aria-hidden="true" /> },
    { mode: 'dms', label: 'Direct messages', icon: <MessageCircle aria-hidden="true" /> },
    { mode: 'communities', label: 'Communities', icon: <Layers3 aria-hidden="true" /> },
    { mode: 'notifications', label: 'Notifications', icon: <Bell aria-hidden="true" /> },
    { mode: 'search', label: 'Search', icon: <Search aria-hidden="true" /> },
    { mode: 'settings', label: 'Settings', icon: <Settings aria-hidden="true" /> },
  ]

  return (
    <aside className="workspace-rail" aria-label="Primary navigation">
      <div className="workspace-rail-top">
        {railItems.map((item) => (
          <button
            key={item.mode}
            type="button"
            className={`rail-button ${mode === item.mode ? 'active' : ''}`}
            onClick={() => onChangeMode(item.mode)}
            aria-label={item.label}
            title={item.label}
          >
            {item.icon}
            {item.mode === 'notifications' && totalUnread > 0 && (
              <span className="rail-badge" aria-hidden="true">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </button>
        ))}
        <span className="rail-divider" aria-hidden="true" />
        <button type="button" className="rail-button" onClick={onCompose} aria-label="Compose new post" title="Compose new post">
          <Plus aria-hidden="true" />
        </button>
      </div>

      <div className="workspace-rail-bottom">
        <button
          type="button"
          className={`rail-button rail-voice ${muted ? 'active' : ''}`}
          onClick={() => setMuted((prev) => !prev)}
          aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
          aria-pressed={muted}
          title={muted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {muted ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
        </button>
        <button
          type="button"
          className={`rail-button rail-voice ${deafened ? 'active' : ''}`}
          onClick={() => setDeafened((prev) => !prev)}
          aria-label={deafened ? 'Undeafen audio' : 'Deafen audio'}
          aria-pressed={deafened}
          title={deafened ? 'Undeafen audio' : 'Deafen audio'}
        >
          {deafened ? <HeadphoneOff aria-hidden="true" /> : <Headphones aria-hidden="true" />}
        </button>
        <button type="button" className="rail-profile" aria-label="Current user profile" title="Current user profile">
          <span className="rail-avatar">N</span>
        </button>
      </div>
    </aside>
  )
}

export default WorkspaceRail
