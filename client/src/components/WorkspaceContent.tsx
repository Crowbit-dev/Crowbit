import { ArrowBigUp, MessageCircle, Search, Share2, Shield, Sparkles, Users } from 'lucide-react'
import { useMemo, type CSSProperties } from 'react'
import type { Community, DirectMessage, Post, WorkspaceMode } from '../appData'

type WorkspaceContentProps = {
  mode: WorkspaceMode
  communities: Community[]
  posts: Post[]
  directMessages: DirectMessage[]
  activeCommunityName: string
  activeChannelId: string
  activeDmId: string
}

type MessageEntry = {
  author: string
  time: string
  body: string
}

function WorkspaceContent({
  mode,
  communities,
  posts,
  directMessages,
  activeCommunityName,
  activeChannelId,
  activeDmId,
}: WorkspaceContentProps) {
  const activeCommunity = useMemo(
    () => communities.find((community) => community.name === activeCommunityName) ?? communities[0],
    [activeCommunityName, communities],
  )
  const activeChannel = useMemo(
    () => activeCommunity.channels.find((channel) => channel.id === activeChannelId) ?? activeCommunity.channels[0],
    [activeChannelId, activeCommunity],
  )
  const activeDm = useMemo(
    () => directMessages.find((message) => message.id === activeDmId) ?? directMessages[0],
    [activeDmId, directMessages],
  )

  if (mode === 'dms') {
    const messages: MessageEntry[] = [
      {
        author: activeDm.name,
        time: 'Yesterday',
        body: activeDm.preview,
      },
      {
        author: 'You',
        time: 'Yesterday',
        body: 'I left feedback on the latest update and marked the next steps.',
      },
      {
        author: activeDm.name,
        time: 'Today',
        body: 'I will send the revised version before the next check-in.',
      },
    ]

    return (
      <main className="workspace-content">
        <section className="content-hero dm-hero">
          <div>
            <p className="content-kicker">Direct messages</p>
            <h1>{activeDm.name}</h1>
            <p className="content-subcopy">{activeDm.role} · {activeDm.status}</p>
          </div>
          <div className="content-chip-row">
            <span className="content-chip">Private</span>
            <span className="content-chip">Fast replies</span>
            <span className="content-chip">Friend-first</span>
          </div>
        </section>

        <section className="panel-stack conversation-panel">
          <div className="conversation-meta-row">
            <div className="member-chip">
              <div className={`status-dot ${activeDm.status}`} />
              <div>
                <strong>{activeDm.name}</strong>
                <span>{activeDm.preview}</span>
              </div>
            </div>
            <div className="mini-stat-card">
              <strong>3</strong>
              <span>shared notes</span>
            </div>
            <div className="mini-stat-card">
              <strong>1m</strong>
              <span>average reply</span>
            </div>
          </div>

          <div className="conversation-feed">
            {messages.map((message) => (
              <article key={`${message.author}-${message.time}`} className="chat-message">
                <div className="message-avatar">{message.author[0]}</div>
                <div className="chat-message-copy">
                  <div className="chat-message-topline">
                    <strong>{message.author}</strong>
                    <span>{message.time}</span>
                  </div>
                  <p>{message.body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="message-composer">
            <div className="composer-toolbar">
              <Sparkles aria-hidden="true" />
              <span>Message {activeDm.name}</span>
            </div>
            <div className="composer-input">Write a private message...</div>
          </div>
        </section>
      </main>
    )
  }

  if (mode === 'search') {
    return (
      <main className="workspace-content">
        <section className="content-hero search-hero">
          <div>
            <p className="content-kicker">Search</p>
            <h1>Find posts, people, and spaces</h1>
            <p className="content-subcopy">Search in one place without changing screens.</p>
          </div>
          <div className="search-hero-card">
            <Search aria-hidden="true" />
            <span>Search the network</span>
          </div>
        </section>

        <section className="panel-stack search-grid">
          {[
            { title: 'Privacy by default', copy: 'Search results respect visibility and data ownership.' },
            { title: 'Communities first', copy: 'Jump directly into the space that matches your query.' },
            { title: 'People and DMs', copy: 'Find the person or conversation you need faster.' },
          ].map((item) => (
            <article key={item.title} className="info-card">
              <strong>{item.title}</strong>
              <p>{item.copy}</p>
            </article>
          ))}
        </section>

        <section className="panel-stack results-card">
          <div className="section-heading-row">
            <h2>Recent results</h2>
            <span>{posts.length + communities.length} items</span>
          </div>
          <div className="result-list">
            {posts.slice(0, 2).map((post) => (
              <article key={post.title} className="result-row">
                <div>
                  <strong>{post.title}</strong>
                  <p>{post.community} · {post.author}</p>
                </div>
                <span>{post.stats.comments} comments</span>
              </article>
            ))}
            {communities.slice(0, 2).map((community) => (
              <article key={community.name} className="result-row">
                <div>
                  <strong>{community.name}</strong>
                  <p>{community.channels.length} channels · {community.members.length} members</p>
                </div>
                <span>Community</span>
              </article>
            ))}
          </div>
        </section>
      </main>
    )
  }

  if (mode === 'settings') {
    return (
      <main className="workspace-content">
        <section className="content-hero settings-hero">
          <div>
            <p className="content-kicker">Settings</p>
            <h1>Privacy, notifications, and appearance</h1>
            <p className="content-subcopy">Tune the app around how public or private you want to be.</p>
          </div>
          <div className="content-chip-row">
            <span className="content-chip">Private by default</span>
            <span className="content-chip">No trackers</span>
          </div>
        </section>

        <section className="panel-stack settings-grid">
          <article className="settings-card">
            <Shield aria-hidden="true" />
            <div>
              <strong>Privacy</strong>
              <p>Control who can view your content, profile, and activity.</p>
            </div>
          </article>
          <article className="settings-card">
            <MessageCircle aria-hidden="true" />
            <div>
              <strong>Notifications</strong>
              <p>Choose alerts for communities, friends, and direct messages.</p>
            </div>
          </article>
          <article className="settings-card">
            <Users aria-hidden="true" />
            <div>
              <strong>Account</strong>
              <p>Manage login methods, sessions, and profile details.</p>
            </div>
          </article>
        </section>
      </main>
    )
  }

  if (mode === 'communities') {
    return (
      <main className="workspace-content">
        <section className="content-hero community-hero">
          <div>
            <p className="content-kicker">Communities</p>
            <h1>{activeCommunity.name}</h1>
            <p className="content-subcopy">
              {activeCommunity.channels.length} channels · {activeCommunity.members.length} members
            </p>
          </div>
          <div className="community-focus-card">
            <p className="content-kicker">Focused channel</p>
            <strong>#{activeChannel.name}</strong>
            <span>{activeChannel.topic}</span>
          </div>
        </section>

        <section className="panel-stack community-grid">
          <article className="community-detail-card">
            <div className="section-heading-row">
              <h2>Channels</h2>
              <span>Active</span>
            </div>
            <div className="channel-grid">
              {activeCommunity.channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`channel-card ${activeChannel.id === channel.id ? 'active' : ''}`}
                  style={{ '--community-color': activeCommunity.color } as CSSProperties}
                >
                  <strong>#{channel.name}</strong>
                  <p>{channel.topic}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="community-detail-card">
            <div className="section-heading-row">
              <h2>Members</h2>
              <span>Online first</span>
            </div>
            <div className="member-grid">
              {activeCommunity.members.map((member) => (
                <div key={member.name} className="member-row">
                  <div className={`status-dot ${member.status}`} />
                  <div>
                    <strong>{member.name}</strong>
                    <p>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="community-detail-card featured-posts-card">
            <div className="section-heading-row">
              <h2>Recent posts</h2>
              <span>From the feed</span>
            </div>
            <div className="result-list">
              {posts
                .filter((post) => post.community === activeCommunity.name)
                .slice(0, 2)
                .map((post) => (
                  <div key={post.title} className="result-row">
                    <div>
                      <strong>{post.title}</strong>
                      <p>{post.author}</p>
                    </div>
                    <span>{post.stats.upvotes}k upvotes</span>
                  </div>
                ))}
            </div>
          </article>
        </section>
      </main>
    )
  }

  const feedHighlights = [
    { value: `${posts.length}`, label: 'new posts' },
    { value: `${communities.length}`, label: 'communities' },
    { value: `${directMessages.filter((message) => message.status === 'online').length}`, label: 'friends online' },
  ]

  return (
    <main className="workspace-content">
      <section className="content-hero feed-hero">
        <div>
          <p className="content-kicker">Feed</p>
          <h1>What’s happening now</h1>
          <p className="content-subcopy">A fast stream of posts, ideas, and activity across the network.</p>
        </div>
        <div className="feed-stat-row">
          {feedHighlights.map((item) => (
            <div key={item.label} className="mini-stat-card">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-stack feed-stack">
        <div className="composer-card">
          <div className="avatar large">N</div>
          <div className="composer-box">Share something...</div>
        </div>

        {posts.map((post) => (
          <article key={`${post.author}-${post.title}`} className="post-card">
            <div className="post-header">
              <div className="avatar-wrap">
                <div className="avatar">{post.author[0]}</div>
              </div>
              <div className="post-meta">
                <div className="post-author-row">
                  <strong>{post.author}</strong>
                  <span className="post-handle">{post.handle}</span>
                  <span className="post-divider">•</span>
                  <span className="post-time">{post.time}</span>
                </div>
                <div
                  className="community-tag"
                  style={{
                    '--community-color': communities.find((community) => community.name === post.community)?.color,
                  } as CSSProperties}
                >
                  <span>{post.community}</span>
                </div>
              </div>
            </div>

            <h3>{post.title}</h3>
            {post.image && <img className="post-image" src={post.image} alt="Placeholder post visual" />}
            <p className="post-body">{post.body}</p>

            <div className="post-stats">
              <button type="button" className="post-action" aria-label={`Upvote ${post.title}`}>
                <ArrowBigUp aria-hidden="true" />
                <span>{post.stats.upvotes}k</span>
              </button>
              <button type="button" className="post-action" aria-label={`View comments for ${post.title}`}>
                <MessageCircle aria-hidden="true" />
                <span>{post.stats.comments}</span>
              </button>
              <button type="button" className="post-action" aria-label={`Share ${post.title}`}>
                <Share2 aria-hidden="true" />
                <span>{post.stats.shares}</span>
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default WorkspaceContent
