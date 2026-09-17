import { useMemo, useState } from 'react'
import './App.css'
import PostModal from './components/PostModal'
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

  return (
    <div className="home-shell">
      <WorkspaceRail
        mode={mode}
        totalUnread={totalUnread}
        onChangeMode={setMode}
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
        />
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
