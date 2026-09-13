import { useState } from 'react'
import './App.css'
import WorkspaceContent from './components/WorkspaceContent'
import WorkspaceRail from './components/WorkspaceRail'
import WorkspaceSidebar from './components/WorkspaceSidebar'
import { communities, directMessages, posts, type WorkspaceMode } from './appData'

function App() {
  const [mode, setMode] = useState<WorkspaceMode>('feed')
  const [activeCommunityName, setActiveCommunityName] = useState(communities[0].name)
  const [activeChannelId, setActiveChannelId] = useState(communities[0].channels[0].id)
  const [activeDmId, setActiveDmId] = useState(directMessages[0].id)

  const selectCommunity = (communityName: string) => {
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

  return (
    <div className="home-shell">
      <WorkspaceRail mode={mode} onChangeMode={setMode} />

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
        />

        <WorkspaceContent
          mode={mode}
          communities={communities}
          posts={posts}
          directMessages={directMessages}
          activeCommunityName={activeCommunityName}
          activeChannelId={activeChannelId}
          activeDmId={activeDmId}
        />
      </div>
    </div>
  )
}

export default App
