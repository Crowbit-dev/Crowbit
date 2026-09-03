import { useState, type CSSProperties } from 'react'
import './App.css'
import crowPhotograph from './assets/crowphotograph.png'
import crowSideProfile from './assets/crowsideprofile.png'

type ViewMode = 'feed' | 'messages'

const communities = [
  { name: 'Design', color: '#533e52' },
  { name: 'Dev', color: '#423341' },
  { name: 'Startup', color: '#515151' },
  { name: 'Tech', color: '#313131' },
  { name: 'Art', color: '#533e52' },
]

const posts = [
  {
    author: 'Nyra',
    handle: '@nyra',
    time: '2h ago',
    community: 'Design',
    title: 'How are you building your personal brand in 2026?',
    body:
      'I am trying to keep my portfolio, content, and design process aligned without burning out. Curious what other creators are doing.',
    image: crowPhotograph,
    stats: { comments: 182, upvotes: 2.4, shares: 42 },
  },
  {
    author: 'Milo',
    handle: '@milo',
    time: '5h ago',
    community: 'Dev',
    title: 'What is everyone using for fast internal tooling right now?',
    body:
      'I am comparing auth, dashboards, and deployment speed. I want something practical, not just shiny demos.',
    image: crowSideProfile,
    stats: { comments: 96, upvotes: 1.8, shares: 21 },
  },
  {
    author: 'Ava',
    handle: '@ava',
    time: '1d ago',
    community: 'Startup',
    title: 'Founders: what do your best community rituals look like?',
    body:
      'The most sustainable communities usually feel less like a launch and more like a habit. I am collecting examples.',
    stats: { comments: 243, upvotes: 3.1, shares: 58 },
  },
]

const messages = [
  { name: 'Maya', status: 'online', preview: 'The deck is ready for review', time: 'now' },
  { name: 'Jules', status: 'away', preview: 'I sent over the mockups', time: '12m' },
  { name: 'Sami', status: 'online', preview: 'We should ship the beta this week', time: '1h' },
  { name: 'Theo', status: 'offline', preview: 'Thanks for the feedback on the post', time: '3h' },
]

function App() {
  const [mode, setMode] = useState<ViewMode>('feed')

  return (
    <div className="home-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">C</div>
          <div>
            <p className="brand-name">Crowbit</p>
            <span className="brand-subtitle">social hub</span>
          </div>
        </div>

        {mode === 'feed' && (
          <nav className="top-nav" aria-label="Main navigation">
            <button type="button" className="nav-pill active">Home</button>
            <button type="button" className="nav-pill">Explore</button>
            <button type="button" className="nav-pill">Communities</button>
          </nav>
        )}

        <div className="top-actions">
          <div className="search-box">Search</div>
          <button type="button" className="mode-toggle" onClick={() => setMode(mode === 'feed' ? 'messages' : 'feed')}>
            {mode === 'feed' ? 'Messages' : 'Feed'}
          </button>
        </div>
      </header>

      <div className="home-layout">
        <aside className="side-panel left-panel">
          <div className="panel-card community-panel-card">
            <p className="panel-label">Your communities</p>
            <div className="community-list">
              {communities.map((community) => (
                <button
                  key={community.name}
                  type="button"
                  className="community-item"
                  style={{ '--community-color': community.color } as CSSProperties}
                >
                  <span className="community-dot" style={{ background: community.color }} />
                  <span className="community-name">{community.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="feed-panel">
          {mode === 'feed' ? (
            <>
              <div className="composer-card">
                <div className="avatar large">N</div>
                <div className="composer-box">Share something...</div>
              </div>

              {posts.map((post) => (
                <article key={`${post.author}-${post.title}`} className="post-card">
                  <div className="post-header">
                    <div className="avatar-wrap">
                      <div className="avatar">{post.author[0]}</div>
                      <span
                        className="community-badge"
                        style={{
                          background: communities.find((community) => community.name === post.community)?.color,
                        }}
                      />
                    </div>
                    <div className="post-meta">
                      <div className="post-author-row">
                        <strong>{post.author}</strong>
                        <span>{post.handle}</span>
                        <span>•</span>
                        <span>{post.time}</span>
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
                  <p className="post-body">{post.body}</p>
                  {post.image && <img className="post-image" src={post.image} alt="Placeholder post visual" />}

                  <div className="post-stats">
                    {/* TODO: Add proper icons for upvotes, comments, and shares */}
                    <span>▲ {post.stats.upvotes}k</span>
                    <span>💬 {post.stats.comments}</span>
                    <span>↗ {post.stats.shares}</span>
                  </div>
                </article>
              ))}
            </>
          ) : (
            <div className="messages-panel">
              <div className="messages-header">
                <h3>Messages</h3>
                <button type="button" className="mini-button">New chat</button>
              </div>

              <div className="message-list">
                {messages.map((message) => (
                  <div key={message.name} className="message-row">
                    <div className="message-avatar">{message.name[0]}</div>
                    <div className="message-copy">
                      <div className="message-topline">
                        <strong>{message.name}</strong>
                        <span>{message.time}</span>
                      </div>
                      <p>{message.preview}</p>
                    </div>
                    <span className={`status-dot ${message.status}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* <aside className="side-panel right-panel">
          <div className="panel-card">
            <p className="panel-label">Online now</p>
            <div className="online-list">
              <div className="online-item"><span className="online-dot" /> Maya</div>
              <div className="online-item"><span className="online-dot" /> Sami</div>
              <div className="online-item"><span className="online-dot" /> Nia</div>
            </div>
          </div>
        </aside> */}
      </div>
    </div>
  )
}

export default App
