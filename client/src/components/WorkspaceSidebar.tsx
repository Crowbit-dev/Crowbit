import { Hash, Search, Settings, Users } from 'lucide-react'
import type { Community, DirectMessage, WorkspaceMode } from '../appData'
import shared from '../styles/shared.module.css'
import styles from './WorkspaceSidebar.module.css'

type WorkspaceSidebarProps = {
  mode: WorkspaceMode
  communities: Community[]
  directMessages: DirectMessage[]
  activeCommunityName: string
  activeChannelId: string
  activeDmId: string
  onSelectCommunity: (communityName: string) => void
  onSelectChannel: (communityName: string, channelId: string) => void
  onSelectDm: (dmId: string) => void
  onOpenChannel: (communityName: string, channelId: string) => void
}

function WorkspaceSidebar({
  mode,
  communities,
  directMessages,
  activeCommunityName,
  activeChannelId,
  activeDmId,
  onSelectCommunity,
  onSelectChannel,
  onSelectDm,
  onOpenChannel,
}: WorkspaceSidebarProps) {
  const activeCommunity = communities.find((community) => community.name === activeCommunityName) ?? communities[0]

  if (mode === 'feed') {
    return (
      <aside className={styles.workspaceSidebar}>
        <div className={styles.sidebarHeadingBlock}>
          <p className={styles.sidebarKicker}>Feed</p>
          <h2>Your spaces</h2>
          <p className={styles.sidebarCopy}>Choose a space to catch up on its latest posts.</p>
        </div>

        <div className={styles.sidebarSearchCard}>
          <Search aria-hidden="true" />
          <span>Search the network</span>
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span>Spaces</span>
            <span>{communities.length}</span>
          </div>
          <div className={styles.sidebarList}>
            {communities.map((community) => (
              <button
                key={community.name}
                type="button"
                className={`${styles.sidebarItem} ${activeCommunity.name === community.name ? styles.active : ''}`}
                onClick={() => onSelectCommunity(community.name)}
              >
                <span className={shared.sidebarDot} style={{ background: community.color }} />
                <span className={styles.sidebarItemCopy}>
                  <strong>{community.name}</strong>
                  <span>{community.members.length} members</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    )
  }

  if (mode === 'dms') {
    return (
      <aside className={styles.workspaceSidebar}>
        <div className={styles.sidebarHeadingBlock}>
          <p className={styles.sidebarKicker}>Direct messages</p>
          <h2>Conversations</h2>
          <p className={styles.sidebarCopy}>Pick up where you left off with friends.</p>
        </div>

        <div className={styles.sidebarSearchCard}>
          <Search aria-hidden="true" />
          <span>Search friends</span>
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span>Friends</span>
            <span>{directMessages.length}</span>
          </div>
          <div className={styles.sidebarList}>
            {directMessages.map((message) => (
              <button
                key={message.id}
                type="button"
                className={`${styles.sidebarItem} ${activeDmId === message.id ? styles.active : ''}`}
                onClick={() => onSelectDm(message.id)}
              >
                <span className={styles.sidebarAvatar}>{message.name[0]}</span>
                <span className={styles.sidebarItemCopy}>
                  <strong>{message.name}</strong>
                  <span>{message.role}</span>
                </span>
                <span className={`${shared.statusDot} ${shared[message.status]}`} />
              </button>
            ))}
          </div>
        </div>
      </aside>
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
      <aside className={styles.workspaceSidebar}>
        <div className={styles.sidebarHeadingBlock}>
          <p className={styles.sidebarKicker}>Notifications</p>
          <h2>Inbox</h2>
          <p className={styles.sidebarCopy}>Unread Activity.</p>
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span>Unread</span>
            <span>{totalUnread}</span>
          </div>
          <div className={styles.sidebarList}>
            {unreadChannels.map(({ community, channel }) => (
              <button
                key={`${community.name}-${channel.id}`}
                type="button"
                className={`${styles.sidebarItem} ${activeCommunityName === community.name && activeChannelId === channel.id ? styles.active : ''}`}
                onClick={() => onOpenChannel(community.name, channel.id)}
              >
                <span className={shared.sidebarDot} style={{ background: community.color }} />
                <span className={styles.sidebarItemCopy}>
                  <strong>#{channel.name}</strong>
                  <span>{community.name}</span>
                </span>
                <span className={shared.sidebarUnreadCount}>{channel.unread}</span>
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
        <div className={styles.sidebarHeadingBlock}>
          <p className={styles.sidebarKicker}>Search</p>
          <h2>Find anything</h2>
          <p className={styles.sidebarCopy}>Search posts, people, and communities from one place.</p>
        </div>

        <div className={styles.sidebarSearchCard}>
          <Search aria-hidden="true" />
          <span>Search the network</span>
        </div>

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
        <div className={styles.sidebarHeadingBlock}>
          <p className={styles.sidebarKicker}>Settings</p>
          <h2>Preferences</h2>
          <p className={styles.sidebarCopy}>Control visibility, notifications, and privacy defaults.</p>
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span>Categories</span>
          </div>
          <div className={styles.sidebarList}>
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarItemIcon}><Users aria-hidden="true" /></span>
              <span className={styles.sidebarItemCopy}>
                <strong>Privacy</strong>
                {/* <span>Audience, visibility, exports</span> */}
              </span>
            </div>
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarItemIcon}><Settings aria-hidden="true" /></span>
              <span className={styles.sidebarItemCopy}>
                <strong>Account</strong>
                {/* <span>Profile, login, sessions</span> */}
              </span>
            </div>
            <div className={styles.sidebarItem}>
              <span className={styles.sidebarItemIcon}><Hash aria-hidden="true" /></span>
              <span className={styles.sidebarItemCopy}>
                <strong>Experience</strong>
                {/* <span>Appearance and interaction density</span> */}
              </span>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className={styles.workspaceSidebar}>
      <div className={styles.sidebarHeadingBlock}>
        <p className={styles.sidebarKicker}>Communities</p>
        <h2>All spaces</h2>
        <p className={styles.sidebarCopy}>Select a community to view its channels and members.</p>
      </div>

      <div className={styles.sidebarSearchCard}>
        <Search aria-hidden="true" />
        <span>Search communities</span>
      </div>

      <div className={styles.sidebarSection}>
        <div className={styles.sidebarSectionHead}>
          <span>Spaces</span>
          <span>{communities.length}</span>
        </div>
        <div className={styles.sidebarList}>
          {communities.map((community) => (
            <button
              key={community.name}
              type="button"
              className={`${styles.sidebarItem} ${activeCommunity.name === community.name ? styles.active : ''}`}
              onClick={() => onSelectCommunity(community.name)}
            >
              <span className={shared.sidebarDot} style={{ background: community.color }} />
              <span className={styles.sidebarItemCopy}>
                <strong>{community.name}</strong>
                <span>{community.members.length} members</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sidebarSection}>
        <div className={styles.sidebarSectionHead}>
          <span>Channels</span>
          <span>Active</span>
        </div>
        <div className={styles.sidebarList}>
          {activeCommunity.channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              className={`${styles.sidebarItem} ${activeChannelId === channel.id ? styles.active : ''}`}
              onClick={() => onSelectChannel(activeCommunity.name, channel.id)}
            >
              <span className={styles.sidebarItemIcon}><Hash aria-hidden="true" /></span>
              <span className={styles.sidebarItemCopy}>
                <strong>{channel.name}</strong>
                <span>{channel.topic}</span>
              </span>
              {channel.unread ? <span className={shared.sidebarUnreadCount}>{channel.unread}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default WorkspaceSidebar
