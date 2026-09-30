import { AtSign, Hash, Heart, House, LayoutGrid, MessageCircle, Reply, Search, Settings, UserPlus, Users, X } from 'lucide-react'
import { useState } from 'react'
import type { Community, DirectMessage, NotificationKind, WorkspaceMode } from '../appData'
import { notifications } from '../appData'
import shared from '../styles/shared.module.css'
import styles from './WorkspaceSidebar.module.css'

type WorkspaceSidebarProps = {
  mode: WorkspaceMode
  communities: Community[]
  directMessages: DirectMessage[]
  activeCommunityName: string
  activeDmId: string
  feedScope: string
  onSelectFeedScope: (scope: string) => void
  notifFilter: 'all' | NotificationKind
  onSelectNotifFilter: (filter: 'all' | NotificationKind) => void
  onSelectCommunity: (communityName: string) => void
  onSelectChannel: (communityName: string, channelId: string) => void
  onSelectDm: (dmId: string) => void
  searchQuery: string
  onSearchQuery: (query: string) => void
}

function SidebarSearch({ value, onChange, placeholder }: { value: string; onChange: (query: string) => void; placeholder: string }) {
  return (
    <label className={styles.sidebarSearchCard}>
      <Search aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={80}
      />
      {value && (
        <button type="button" className={styles.sidebarClear} onClick={() => onChange('')} aria-label="Clear search" title="Clear search">
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </label>
  )
}

function SidebarHeading({ id, kicker, title, copy }: { id: string; kicker: string; title: string; copy: string }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(`sidebar-heading-dismissed:${id}`) === '1')
  if (dismissed) return null
  const dismiss = () => {
    localStorage.setItem(`sidebar-heading-dismissed:${id}`, '1')
    setDismissed(true)
  }
  return (
    <div className={styles.sidebarHeadingBlock}>
      <button type="button" className={styles.sidebarHeadingDismiss} onClick={dismiss} aria-label="Dismiss introduction" title="Dismiss">
        <X size={14} aria-hidden="true" />
      </button>
      <p className={styles.sidebarKicker}>{kicker}</p>
      <h2>{title}</h2>
      <p className={styles.sidebarCopy}>{copy}</p>
    </div>
  )
}

function WorkspaceSidebar({
  mode,
  communities,
  directMessages,
  activeCommunityName,
  activeDmId,
  feedScope,
  onSelectFeedScope,
  notifFilter,
  onSelectNotifFilter,
  onSelectCommunity,
  onSelectDm,
  searchQuery,
  onSearchQuery,
}: WorkspaceSidebarProps) {
  const activeCommunity = communities.find((community) => community.name === activeCommunityName) ?? communities[0]
  const query = searchQuery.trim().toLowerCase()

  if (mode === 'feed') {
    const visibleCommunities = query
      ? communities.filter((community) => community.name.toLowerCase().includes(query))
      : communities

    return (
      <aside className={styles.workspaceSidebar}>
        <SidebarHeading key="feed" id="feed" kicker="Feed" title="Your spaces" copy="Choose a space to catch up on its latest posts." />

        <SidebarSearch value={searchQuery} onChange={onSearchQuery} placeholder="Search the network" />

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span>Spaces</span>
            <span>{communities.length}</span>
          </div>
          <div className={styles.sidebarList}>
            {!query && (
              <>
                <button
                  type="button"
                  className={`${styles.sidebarItem} ${feedScope === 'all' ? styles.active : ''}`}
                  onClick={() => onSelectFeedScope('all')}
                >
                  <span className={styles.sidebarItemIcon}><LayoutGrid aria-hidden="true" /></span>
                  <span className={styles.sidebarItemCopy}>
                    <strong>All</strong>
                    <span>Every space</span>
                  </span>
                </button>
                <button
                  type="button"
                  className={`${styles.sidebarItem} ${feedScope === 'home' ? styles.active : ''}`}
                  onClick={() => onSelectFeedScope('home')}
                >
                  <span className={styles.sidebarItemIcon}><House aria-hidden="true" /></span>
                  <span className={styles.sidebarItemCopy}>
                    <strong>Home</strong>
                    <span>Your spaces</span>
                  </span>
                </button>
              </>
            )}
            {visibleCommunities.map((community) => (
              <button
                key={community.name}
                type="button"
                className={`${styles.sidebarItem} ${feedScope === community.name ? styles.active : ''}`}
                onClick={() => onSelectFeedScope(community.name)}
              >
                <span className={shared.sidebarDot} style={{ background: community.color }} />
                <span className={styles.sidebarItemCopy}>
                  <strong>{community.name}</strong>
                  <span>{community.members.length} members</span>
                </span>
              </button>
            ))}
            {visibleCommunities.length === 0 && (
              <p className={styles.sidebarEmpty}>No spaces match “{searchQuery.trim()}”.</p>
            )}
          </div>
        </div>
      </aside>
    )
  }

  if (mode === 'dms') {
    const visibleFriends = query
      ? directMessages.filter((message) => `${message.name} ${message.customStatus}`.toLowerCase().includes(query))
      : directMessages

    return (
      <aside className={styles.workspaceSidebar}>
        <SidebarHeading key="dms" id="dms" kicker="Direct messages" title="Conversations" copy="Pick up where you left off with friends." />

        <SidebarSearch value={searchQuery} onChange={onSearchQuery} placeholder="Search friends" />

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span>Friends</span>
            <span>{directMessages.length}</span>
          </div>
          <div className={styles.sidebarList}>
            {visibleFriends.map((message) => (
              <button
                key={message.id}
                type="button"
                className={`${styles.sidebarItem} ${activeDmId === message.id ? styles.active : ''}`}
                onClick={() => onSelectDm(message.id)}
              >
                <span className={styles.sidebarPresence}>
                  <span className={styles.sidebarAvatar}>{message.name[0]}</span>
                  <span className={`${shared.statusDot} ${shared[message.status]} ${shared.presenceDot}`} />
                </span>
                <span className={styles.sidebarItemCopy}>
                  <strong>{message.name}</strong>
                  <span>{message.customStatus}</span>
                </span>
              </button>
            ))}
            {visibleFriends.length === 0 && (
              <p className={styles.sidebarEmpty}>No friends match “{searchQuery.trim()}”.</p>
            )}
          </div>
        </div>
      </aside>
    )
  }

  if (mode === 'notifications') {
    const filters = [
      { id: 'all', label: 'All activity', icon: <LayoutGrid size={16} aria-hidden="true" /> },
      { id: 'mention', label: 'Mentions', icon: <AtSign size={16} aria-hidden="true" /> },
      { id: 'like', label: 'Likes', icon: <Heart size={16} aria-hidden="true" /> },
      { id: 'follow_request', label: 'Follow requests', icon: <UserPlus size={16} aria-hidden="true" /> },
      { id: 'reply', label: 'Replies', icon: <Reply size={16} aria-hidden="true" /> },
      { id: 'comment', label: 'Comments', icon: <MessageCircle size={16} aria-hidden="true" /> },
    ] as const
    const countFor = (id: 'all' | NotificationKind) =>
      id === 'all' ? notifications.length : notifications.filter((item) => item.kind === id).length

    return (
      <aside className={styles.workspaceSidebar}>
        <SidebarHeading key="notifications" id="notifications" kicker="Notifications" title="Inbox" copy="Unread Activity." />

        <SidebarSearch value={searchQuery} onChange={onSearchQuery} placeholder="Search activity" />

        <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHead}>
              <span>Filters</span>
            </div>
          <div className={styles.sidebarList}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`${styles.sidebarItem} ${notifFilter === filter.id ? styles.active : ''}`}
                onClick={() => onSelectNotifFilter(filter.id)}
              >
                <span className={styles.sidebarItemIcon}>{filter.icon}</span>
                <span className={styles.sidebarItemCopy}>
                  <strong>{filter.label}</strong>
                </span>
                <span className={shared.sidebarUnreadCount}>{countFor(filter.id)}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  if (mode === 'search') {
    return (
      <aside className={styles.workspaceSidebar}>
        <SidebarHeading key="search" id="search" kicker="Search" title="Find anything" copy="Search posts, people, and communities from one place." />

        <SidebarSearch value={searchQuery} onChange={onSearchQuery} placeholder="Search the network" />

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span>Filters</span>
          </div>
          <div className={styles.sidebarChipList}>
            <button type="button" className={`${styles.sidebarChip} ${styles.active}`}>Posts</button>
            <button type="button" className={styles.sidebarChip}>People</button>
            <button type="button" className={styles.sidebarChip}>Communities</button>
          </div>
        </div>
      </aside>
    )
  }

  if (mode === 'settings') {
    return (
      <aside className={styles.workspaceSidebar}>
        <SidebarHeading key="settings" id="settings" kicker="Settings" title="Preferences" copy="Control visibility, notifications, and privacy defaults." />

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span>Categories</span>
          </div>
          <div className={styles.sidebarList}>
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarItemIcon}><Users aria-hidden="true" /></span>
              <span className={styles.sidebarItemCopy}>
                <strong>Privacy</strong>
              </span>
            </div>
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarItemIcon}><Settings aria-hidden="true" /></span>
              <span className={styles.sidebarItemCopy}>
                <strong>Account</strong>
              </span>
            </div>
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarItemIcon}><Hash aria-hidden="true" /></span>
              <span className={styles.sidebarItemCopy}>
                <strong>Experience</strong>
              </span>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className={styles.workspaceSidebar}>
      <SidebarHeading key="communities" id="communities" kicker="Communities" title="All spaces" copy="Select a community to view its channels and members." />

      <SidebarSearch value={searchQuery} onChange={onSearchQuery} placeholder="Search communities" />

      <div className={styles.sidebarSection}>
        <div className={styles.sidebarSectionHead}>
          <span>Spaces</span>
          <span>{communities.length}</span>
        </div>
        <div className={styles.sidebarList}>
          {(query ? communities.filter((community) => community.name.toLowerCase().includes(query)) : communities).map((community) => (
            <button
              key={community.name}
              type="button"
              className={`${styles.sidebarItem} ${styles.compact} ${activeCommunity.name === community.name ? styles.active : ''}`}
              onClick={() => onSelectCommunity(community.name)}
            >
              <span className={shared.sidebarDot} style={{ background: community.color }} />
              <span className={styles.sidebarItemCopy}>
                <strong>{community.name}</strong>
              </span>
            </button>
          ))}
          {query && !communities.some((community) => community.name.toLowerCase().includes(query)) && (
            <p className={styles.sidebarEmpty}>No spaces match “{searchQuery.trim()}”.</p>
          )}
        </div>
      </div>
    </aside>
  )
}

export default WorkspaceSidebar
