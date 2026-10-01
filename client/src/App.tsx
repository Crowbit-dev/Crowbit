import { useEffect, useRef, useState } from 'react'
import './App.css'
import ContextMenu, { type ContextMenuItem, type ContextMenuState } from './components/ContextMenu'
import PostModal from './components/PostModal'
import ThreadPanel from './components/ThreadPanel'
import WorkspaceContent from './components/WorkspaceContent'
import WorkspaceRail from './components/WorkspaceRail'
import WorkspaceSidebar from './components/WorkspaceSidebar'
import { communities, directMessages, notifications, posts } from './appData'
import type { NotificationKind, Post, SearchFilter, WorkspaceMode } from './types'

type LastVisited = {
  community: string
  channels: Record<string, string>
  dm: string
  feed: string
}

const LAST_VISITED_KEY = 'crowbit-last-visited'
const RECENT_SEARCHES_KEY = 'crowbit-recent-searches'
const MAX_RECENT_SEARCHES = 6

function isFeedScope(value: unknown): value is string {
  return value === 'all' ||
    value === 'home' ||
    (typeof value === 'string' && communities.some((entry) => entry.name === value))
}

function channelFor(communityName: string, channels: Record<string, string>): string {
  const community = communities.find((entry) => entry.name === communityName) ?? communities[0]
  const stored = channels[community.name]
  if (stored && community.channels.some((channel) => channel.id === stored)) return stored
  return community.channels[0]?.id ?? 'general'
}

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0).map((entry) => entry.trim().slice(0, 80)).slice(0, MAX_RECENT_SEARCHES)
  } catch {
    return []
  }
}

function loadLastVisited(): LastVisited {
  const fallback: LastVisited = {
    community: communities[0].name,
    channels: {},
    dm: directMessages[0].id,
    feed: 'home',
  }
  try {
    const raw = localStorage.getItem(LAST_VISITED_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<LastVisited>
    const community = typeof parsed.community === 'string' &&
      parsed.community !== 'all' &&
      parsed.community !== 'home' &&
      communities.some((entry) => entry.name === parsed.community)
      ? parsed.community
      : fallback.community
    const channels: Record<string, string> = {}
    if (parsed.channels && typeof parsed.channels === 'object') {
      for (const [name, id] of Object.entries(parsed.channels)) {
        const owner = communities.find((entry) => entry.name === name)
        if (owner && typeof id === 'string' && owner.channels.some((channel) => channel.id === id)) {
          channels[name] = id
        }
      }
    }
    const dm = typeof parsed.dm === 'string' && directMessages.some((entry) => entry.id === parsed.dm)
      ? parsed.dm
      : fallback.dm
    return {
      community,
      channels,
      dm,
      feed: isFeedScope(parsed.feed) ? parsed.feed : fallback.feed,
    }
  } catch {
    return fallback
  }
}

function App() {
  const [mode, setMode] = useState<WorkspaceMode>('feed')
  const [lastVisited, setLastVisited] = useState<LastVisited>(loadLastVisited)
  const [activeCommunityName, setActiveCommunityName] = useState(lastVisited.community)
  const [feedScope, setFeedScope] = useState(lastVisited.feed)
  const [activeChannelId, setActiveChannelId] = useState(() => channelFor(lastVisited.community, lastVisited.channels))
  const [activeDmId, setActiveDmId] = useState(lastVisited.dm)
  const [notifFilter, setNotifFilter] = useState<'all' | NotificationKind>('all')
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all')
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches)
  const [localPosts, setLocalPosts] = useState(posts)
  const [composerOpen, setComposerOpen] = useState(false)
  const [searchQueries, setSearchQueries] = useState<Record<WorkspaceMode, string>>({
    feed: '',
    dms: '',
    communities: '',
    notifications: '',
    search: '',
    settings: '',
  })
  const [activeThread, setActiveThread] = useState<Post | null>(null)
  const [threadVisible, setThreadVisible] = useState(false)
  const threadCloseTimer = useRef<number | null>(null)
  const [menu, setMenu] = useState<ContextMenuState | null>(null)
  const modalityRef = useRef<'mouse' | 'keyboard'>('mouse')
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth)
  const [threadWidth, setThreadWidth] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('thread-width'))
      if (Number.isFinite(saved) && saved >= 280 && saved <= 720) return saved
    } catch {
      // Storage unavailable — fall through to the default.
    }
    return 400
  })

  const selectFeedScope = (scope: string) => {
    setFeedScope(scope)
    setLastVisited((prev) => ({ ...prev, feed: scope }))
  }

  const selectCommunity = (communityName: string) => {
    const community = communities.find((entry) => entry.name === communityName) ?? communities[0]
    setActiveCommunityName(community.name)
    setActiveChannelId(channelFor(community.name, lastVisited.channels))
    setLastVisited((prev) => ({ ...prev, community: community.name }))
  }

  const selectChannel = (communityName: string, channelId: string) => {
    setActiveCommunityName(communityName)
    setActiveChannelId(channelId)
    setLastVisited((prev) => ({
      ...prev,
      community: communityName,
      channels: { ...prev.channels, [communityName]: channelId },
    }))
  }

  const selectDm = (dmId: string) => {
    setActiveDmId(dmId)
    setLastVisited((prev) => ({ ...prev, dm: dmId }))
  }

  const openDm = (dmId: string) => {
    selectDm(dmId)
    setMode('dms')
  }

  const commitSearch = (query: string) => {
    const trimmed = query.trim().slice(0, 80)
    if (!trimmed) return
    setSearchQueries((prev) => ({ ...prev, search: trimmed }))
    setRecentSearches((prev) => [trimmed, ...prev.filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT_SEARCHES))
  }

  const clearRecentSearches = () => setRecentSearches([])

  const openChannel = (communityName: string, channelId: string) => {
    selectChannel(communityName, channelId)
    setMode('communities')
  }

  const totalUnread = notifications.length

  const composerDefault = communities.some((community) => community.name === activeCommunityName)
    ? activeCommunityName
    : (communities.some((community) => community.name === feedScope)
      ? feedScope
      : (communities.find((community) => community.joined)?.name ?? communities[0].name))

  const handlePost = (post: Post) => {
    setLocalPosts((prev) => [post, ...prev])
    setComposerOpen(false)
    setMode('feed')
  }

  // LOCAL-ONLY: removes from in-memory state; nothing persists without a backend.
  const handleDeletePost = (post: Post) => {
    setLocalPosts((prev) => prev.filter((entry) => !(entry.author === post.author && entry.title === post.title)))
    setActiveThread((prev) => (prev && prev.author === post.author && prev.title === post.title ? null : prev))
  }

  useEffect(() => {
    const onPointerDown = () => {
      modalityRef.current = 'mouse'
    }
    const onKeyDown = () => {
      modalityRef.current = 'keyboard'
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LAST_VISITED_KEY, JSON.stringify(lastVisited))
    } catch {
      // Storage unavailable — tracking still applies for this session.
    }
  }, [lastVisited])

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches))
    } catch {
      // Storage unavailable — recents still apply for this session.
    }
  }, [recentSearches])

  const openMenu = (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null, toggle = false) => {
    setMenu((prev) => (toggle && prev && invoker !== null && prev.invoker === invoker
      ? null
      : { x, y, items, invoker, keyboard: modalityRef.current === 'keyboard', toggle }))
  }

  const closeMenu = () => setMenu(null)

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

  const handleThreadWidth = (width: number) => {
    const clamped = Math.round(Math.min(threadMaxWidth, Math.max(280, width)))
    setThreadWidth(clamped)
    try {
      localStorage.setItem('thread-width', String(clamped))
    } catch {
      // Storage unavailable — width still applies for this session.
    }
  }

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Rail (84) + sidebar (320) + content padding (48) + full post width (760).
  // The panel stops growing before posts would have to shrink.
  const threadMaxWidth = Math.max(280, windowWidth - 1212)
  const clampedThreadWidth = Math.min(threadWidth, threadMaxWidth)

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
          if (nextMode === 'feed') {
            setFeedScope(lastVisited.feed)
          } else if (nextMode === 'communities') {
            setActiveCommunityName(lastVisited.community)
            setActiveChannelId(channelFor(lastVisited.community, lastVisited.channels))
          } else if (nextMode === 'dms') {
            setActiveDmId(lastVisited.dm)
          }
          setMode(nextMode)
          closeThreadNow()
          closeMenu()
        }}
        onCompose={() => setComposerOpen(true)}
      />

      <div className={`workspace-frame${mode === 'communities' ? ' narrow-sidebar' : ''}`}>
        <WorkspaceSidebar
          mode={mode}
          communities={communities}
          directMessages={directMessages}
          posts={localPosts}
          activeCommunityName={activeCommunityName}
          activeDmId={activeDmId}
          feedScope={feedScope}
          onSelectFeedScope={selectFeedScope}
          onSelectCommunity={selectCommunity}
          onSelectChannel={selectChannel}
          notifFilter={notifFilter}
          onSelectNotifFilter={setNotifFilter}
          onSelectDm={selectDm}
          searchQuery={searchQueries[mode]}
          onSearchQuery={(query) => setSearchQueries((prev) => ({ ...prev, [mode]: query }))}
          searchFilter={searchFilter}
          onSelectSearchFilter={setSearchFilter}
          recentSearches={recentSearches}
          onCommitSearch={commitSearch}
          onClearRecentSearches={clearRecentSearches}
        />

        <WorkspaceContent
          mode={mode}
          communities={communities}
          posts={localPosts}
          directMessages={directMessages}
          activeCommunityName={activeCommunityName}
          activeChannelId={activeChannelId}
          activeDmId={activeDmId}
          feedScope={feedScope}
          onOpenChannel={openChannel}
          notifFilter={notifFilter}
          onOpenThread={toggleThread}
          onDeletePost={handleDeletePost}
          threadShift={activeThread ? clampedThreadWidth : 0}
          openMenu={openMenu}
          searchQuery={searchQueries[mode]}
          onSearchQuery={(query) => setSearchQueries((prev) => ({ ...prev, [mode]: query }))}
          searchFilter={searchFilter}
          onOpenDm={openDm}
        />

        {activeThread && (
          <div
            className={`thread-wrap${threadVisible ? ' open' : ''}`}
            style={{ width: clampedThreadWidth }}
          >
            <ThreadPanel
              key={`${activeThread.author}-${activeThread.title}`}
              post={activeThread}
              onClose={closeThread}
              width={clampedThreadWidth}
              maxWidth={threadMaxWidth}
              onResizeWidth={handleThreadWidth}
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
      {menu && <ContextMenu menu={menu} onClose={closeMenu} />}
    </div>
  )
}

export default App
