import { Hash, Search, Settings, Users } from 'lucide-react'
import type { Community, DirectMessage, WorkspaceMode } from '../appData'

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
}: WorkspaceSidebarProps) {
  const activeCommunity = communities.find((community) => community.name === activeCommunityName) ?? communities[0]

  if (mode === 'feed') {
    return (
      <aside className="workspace-sidebar">
        <div className="sidebar-heading-block">
          <p className="sidebar-kicker">Feed</p>
          <h2>What’s happening</h2>
          <p className="sidebar-copy">Keep an eye on your spaces without the channel list taking over the sidebar.</p>
        </div>

        <div className="sidebar-search-card">
          <Search aria-hidden="true" />
          <span>Search the network</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-head">
            <span>Spaces</span>
            <span>{communities.length}</span>
          </div>
          <div className="sidebar-list">
            {communities.map((community) => (
              <button
                key={community.name}
                type="button"
                className={`sidebar-item ${activeCommunity.name === community.name ? 'active' : ''}`}
                onClick={() => onSelectCommunity(community.name)}
              >
                <span className="sidebar-dot" style={{ background: community.color }} />
                <span className="sidebar-item-copy">
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
      <aside className="workspace-sidebar">
        <div className="sidebar-heading-block">
          <p className="sidebar-kicker">Friends</p>
          <h2>Direct access</h2>
          <p className="sidebar-copy">Private chats, shared notes, and quick replies.</p>
        </div>

        <div className="sidebar-search-card">
          <Search aria-hidden="true" />
          <span>Search friends</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-head">
            <span>Friends</span>
            <span>{directMessages.length}</span>
          </div>
          <div className="sidebar-list">
            {directMessages.map((message) => (
              <button
                key={message.id}
                type="button"
                className={`sidebar-item dm-item ${activeDmId === message.id ? 'active' : ''}`}
                onClick={() => onSelectDm(message.id)}
              >
                <span className="sidebar-avatar">{message.name[0]}</span>
                <span className="sidebar-item-copy">
                  <strong>{message.name}</strong>
                  <span>{message.role}</span>
                </span>
                <span className={`status-dot ${message.status}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-card sidebar-note-card">
          <p className="sidebar-kicker">Status</p>
          <strong>{directMessages.filter((message) => message.status === 'online').length} friends online</strong>
          <span>Keep this list lightweight and message-first.</span>
        </div>
      </aside>
    )
  }

  if (mode === 'search') {
    return (
      <aside className="workspace-sidebar">
        <div className="sidebar-heading-block">
          <p className="sidebar-kicker">Search</p>
          <h2>Find anything</h2>
          <p className="sidebar-copy">Search posts, people, and communities from one place.</p>
        </div>

        <div className="sidebar-search-card">
          <Search aria-hidden="true" />
          <span>Search the network</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-head">
            <span>Filters</span>
          </div>
          <div className="sidebar-chip-list">
            <button type="button" className="sidebar-chip active">Posts</button>
            <button type="button" className="sidebar-chip">People</button>
            <button type="button" className="sidebar-chip">Communities</button>
          </div>
        </div>

        <div className="sidebar-card sidebar-note-card">
          <p className="sidebar-kicker">Recent</p>
          <strong>Design systems, privacy, moderation</strong>
          <span>Suggested based on your activity.</span>
        </div>
      </aside>
    )
  }

  if (mode === 'settings') {
    return (
      <aside className="workspace-sidebar">
        <div className="sidebar-heading-block">
          <p className="sidebar-kicker">Settings</p>
          <h2>Preferences</h2>
          <p className="sidebar-copy">Control visibility, notifications, and privacy defaults.</p>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-head">
            <span>Categories</span>
          </div>
          <div className="sidebar-list settings-list">
            <div className="sidebar-item static-item">
              <span className="sidebar-item-icon"><Users aria-hidden="true" /></span>
              <span className="sidebar-item-copy">
                <strong>Privacy</strong>
                <span>Audience, visibility, exports</span>
              </span>
            </div>
            <div className="sidebar-item static-item">
              <span className="sidebar-item-icon"><Settings aria-hidden="true" /></span>
              <span className="sidebar-item-copy">
                <strong>Account</strong>
                <span>Profile, login, sessions</span>
              </span>
            </div>
            <div className="sidebar-item static-item">
              <span className="sidebar-item-icon"><Hash aria-hidden="true" /></span>
              <span className="sidebar-item-copy">
                <strong>Experience</strong>
                <span>Appearance and interaction density</span>
              </span>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="workspace-sidebar">
      <div className="sidebar-heading-block">
        <p className="sidebar-kicker">Communities</p>
        <h2>{mode === 'communities' ? 'All spaces' : 'Your spaces'}</h2>
        <p className="sidebar-copy">Pick a community, then drill into channels and members.</p>
      </div>

      <div className="sidebar-search-card">
        <Search aria-hidden="true" />
        <span>Search communities</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-head">
          <span>Spaces</span>
          <span>{communities.length}</span>
        </div>
        <div className="sidebar-list">
          {communities.map((community) => (
            <button
              key={community.name}
              type="button"
              className={`sidebar-item ${activeCommunity.name === community.name ? 'active' : ''}`}
              onClick={() => onSelectCommunity(community.name)}
            >
              <span className="sidebar-dot" style={{ background: community.color }} />
              <span className="sidebar-item-copy">
                <strong>{community.name}</strong>
                <span>{community.members.length} members</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-head">
          <span>Channels</span>
          <span>Active</span>
        </div>
        <div className="sidebar-list">
          {activeCommunity.channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              className={`sidebar-item channel-item ${activeChannelId === channel.id ? 'active' : ''}`}
              onClick={() => onSelectChannel(activeCommunity.name, channel.id)}
            >
              <span className="sidebar-item-icon"><Hash aria-hidden="true" /></span>
              <span className="sidebar-item-copy">
                <strong>{channel.name}</strong>
                <span>{channel.topic}</span>
              </span>
              {channel.unread ? <span className="unread-pill">{channel.unread}</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-card sidebar-note-card">
        <p className="sidebar-kicker">Members</p>
        <strong>{activeCommunity.members.length} in {activeCommunity.name}</strong>
        <span>Use the content area to focus on the selected space.</span>
      </div>
    </aside>
  )
}

export default WorkspaceSidebar
