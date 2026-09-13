import { Layers3, Menu, MessageCircle, Search, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import type { WorkspaceMode } from '../appData'

type RailItem = {
  mode: WorkspaceMode
  label: string
  icon: ReactNode
}

type WorkspaceRailProps = {
  mode: WorkspaceMode
  onChangeMode: (nextMode: WorkspaceMode) => void
}

function WorkspaceRail({ mode, onChangeMode }: WorkspaceRailProps) {
  const railItems: RailItem[] = [
    { mode: 'feed', label: 'Feed', icon: <Menu aria-hidden="true" /> },
    { mode: 'dms', label: 'Direct messages', icon: <MessageCircle aria-hidden="true" /> },
    { mode: 'communities', label: 'Communities', icon: <Layers3 aria-hidden="true" /> },
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
          </button>
        ))}
      </div>

      <button type="button" className="rail-profile" aria-label="Current user profile" title="Current user profile">
        <span className="rail-avatar">N</span>
      </button>
    </aside>
  )
}

export default WorkspaceRail
