import { useMemo, useRef, useState } from 'react'
import './App.css'
import PostModal from './components/PostModal'
import ThreadPanel from './components/ThreadPanel'
import WorkspaceContent from './components/WorkspaceContent'
import WorkspaceRail from './components/WorkspaceRail'
import WorkspaceSidebar from './components/WorkspaceSidebar'
import { communities, directMessages, posts, type Post, type WorkspaceMode } from './appData'

function App() {
  const [mode, setMode] = useState<WorkspaceMode>('feed')
  const [activeCommunityName, setActiveCommunityName] = useState('home')
  const [activeChannelId, setActiveChannelId] = useState(communities[0].channels[0].id)
  const [activeDmId, setActiveDmId] = useState(directMessages[0].id)
  const [localPosts, setLocalPosts] = useState(posts)
  const [composerOpen, setComposerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeThread, setActiveThread] = useState<Post | null>(null)
  const [threadVisible, setThreadVisible] = useState(false)
  const threadCloseTimer = useRef<number | null>(null)

  const selectCommunity = (communityName: string) => {
    if (communityName === 'all' || communityName === 'home') {
      setActiveCommunityName(communityName)
      return
    }
    const community = communities.find((entry) => entry.name === communityName) ?? communities[0]
    setActiveCommunityName(community.name)
    setActiveChannelId(community.channels[0]?.id ?? 'general')
  }

  const selectChannel = (communityName: string, channelId: string) => {
    setActiveCommunityName(communityName)
    setActiveChannelId(channelId)
  }

  const selectDm = (dmId: string) => {
    setActiveDmId(dmId)
  }

  const openChannel = (communityName: string, channelId: string) => {
    selectChannel(communityName, channelId)
    setMode('communities')
  }

  const totalUnread = useMemo(
    () => communities.reduce((sum, community) => sum + community.channels.reduce((inner, channel) => inner + (channel.unread ?? 0), 0), 0),
    [],
  )

  const composerDefault = communities.some((community) => community.name === activeCommunityName)
    ? activeCommunityName
    : (communities.find((community) => community.joined)?.name ?? communities[0].name)

  const handlePost = (post: Post) => {
    setLocalPosts((prev) => [post, ...prev])
    setComposerOpen(false)
    setMode('feed')
  }

  const openThread = (post: Post) => {
    if (threadCloseTimer.current !== null) {
      window.clearTimeout(threadCloseTimer.current)
      threadCloseTimer.current = null
    }
    setActiveThread(post)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setThreadVisible(true))
    })
  }

  const closeThread = () => {
    setThreadVisible(false)
    if (threadCloseTimer.current !== null) {
      window.clearTimeout(threadCloseTimer.current)
    }
    threadCloseTimer.current = window.setTimeout(() => {
      setActiveThread(null)
      threadCloseTimer.current = null
    }, 200)
  }

  const toggleThread = (post: Post) => {
    if (activeThread && activeThread.author === post.author && activeThread.title === post.title) {
      closeThread()
    } else {
      openThread(post)
    }
  }

  const closeThreadNow = () => {
    if (threadCloseTimer.current !== null) {
      window.clearTimeout(threadCloseTimer.current)
      threadCloseTimer.current = null
    }
    setThreadVisible(false)
    setActiveThread(null)
  }

  return (
    <div className="home-shell">
      <WorkspaceRail
        mode={mode}
        totalUnread={totalUnread}
        onChangeMode={(nextMode) => {
          setMode(nextMode)
          closeThreadNow()
        }}
        onCompose={() => setComposerOpen(true)}
      />

      <div className="workspace-frame">
        <WorkspaceSidebar
          mode={mode}
          communities={communities}
          directMessages={directMessages}
          activeCommunityName={activeCommunityName}
          activeChannelId={activeChannelId}
          activeDmId={activeDmId}
          onSelectCommunity={selectCommunity}
          onSelectChannel={selectChannel}
          onSelectDm={selectDm}
          onOpenChannel={openChannel}
          searchQuery={searchQuery}
          onSearchQuery={setSearchQuery}
        />

        <WorkspaceContent
          mode={mode}
          communities={communities}
          posts={localPosts}
          directMessages={directMessages}
          activeCommunityName={activeCommunityName}
          activeChannelId={activeChannelId}
          activeDmId={activeDmId}
          onOpenChannel={openChannel}
          onOpenThread={toggleThread}
          threadOpen={activeThread !== null}
          searchQuery={searchQuery}
          onSearchQuery={setSearchQuery}
        />

        {activeThread && (
          <div className={`thread-wrap${threadVisible ? ' open' : ''}`}>
            <ThreadPanel
              key={`${activeThread.author}-${activeThread.title}`}
              post={activeThread}
              onClose={closeThread}
            />
          </div>
        )}
      </div>
      {composerOpen && (
        <PostModal
          communities={communities}
          defaultCommunity={composerDefault}
          onClose={() => setComposerOpen(false)}
          onPost={handlePost}
        />
      )}
    </div>
  )
}

export default App
