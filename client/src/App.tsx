import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import './App.css';
import ContextMenu, { type ContextMenuItem, type ContextMenuState } from './components/ContextMenu';
import NotFound from './NotFound';
import PostModal from './components/PostModal';
import ThreadPanel from './components/ThreadPanel';
import WorkspaceContent from './components/workspace-content/WorkspaceContent';
import {
	CHAT_TEXT_SIZES,
	CHAT_TEXT_SIZE_DEFAULT,
	MESSAGE_SPACINGS,
	MESSAGE_SPACING_DEFAULT,
	SATURATION_DEFAULT,
	snapCheckpoint,
} from './lib/chatScales';
import WorkspaceRail from './components/WorkspaceRail';
import WorkspaceSidebar from './components/WorkspaceSidebar';
import { communities, currentUser, directMessages, notifications, posts } from './appData';
import {
	communityPath,
	dmsPath,
	feedPath,
	notificationsPath,
	parseWorkspacePath,
	profilePath,
	searchPath,
	settingsPath,
} from './lib/workspacePaths';
import { findProfileUser, type ProfileUser } from './lib/profileUser';
import type {
	DirectMessage,
	MessageRequestsAudience,
	NotificationAudience,
	NotificationKind,
	Post,
	SearchFilter,
	SettingsCategory,
	SettingsPrefs,
	WorkspaceMode,
} from './types';

type LastVisited = {
	community: string;
	channels: Record<string, string>;
	dm: string;
	feed: string;
};

const LAST_VISITED_KEY = 'crowbit-last-visited';
const RECENT_SEARCHES_KEY = 'crowbit-recent-searches';
const MAX_RECENT_SEARCHES = 6;
const SETTINGS_KEY = 'crowbit-settings';

const DEFAULT_SETTINGS: SettingsPrefs = {
	account: { displayName: '', username: '', email: '', twoFactor: false },
	privacy: {
		profileVisibility: 'public',
		showReadActivity: true,
		readReceipts: true,
		typingIndicators: true,
		showCloseFriendsBadge: true,
		messageRequests: 'everyone',
	},
	notifications: {
		mention: 'everyone',
		like: 'everyone',
		friend_request: true,
		reply: 'everyone',
		comment: 'everyone',
	},
	mutedSenders: { notFollowing: false, notFollowedBy: false },
	accessibility: {
		reduceMotion: false,
		compactDensity: false,
		chatTextSize: CHAT_TEXT_SIZE_DEFAULT,
		messageSpacing: MESSAGE_SPACING_DEFAULT,
		saturation: SATURATION_DEFAULT,
	},
	voice: { noiseSuppression: true, echoCancellation: true, microphone: 'Default', camera: 'Off' },
};

function loadSettings(): SettingsPrefs {
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		if (!raw) return DEFAULT_SETTINGS;
		const parsed = JSON.parse(raw) as Partial<SettingsPrefs>;
		const kindAudience = (value: unknown): NotificationAudience =>
			(['everyone', 'friends', 'following', 'off'] as NotificationAudience[]).includes(value as NotificationAudience)
				? (value as NotificationAudience)
				: 'everyone';
		return {
			account: {
				displayName: typeof parsed.account?.displayName === 'string' ? parsed.account.displayName.slice(0, 32) : '',
				username:
					typeof parsed.account?.username === 'string'
						? parsed.account.username.replace(/^@+/, '').trim().slice(0, 32)
						: '',
				email: typeof parsed.account?.email === 'string' ? parsed.account.email.trim().slice(0, 64) : '',
				twoFactor: parsed.account?.twoFactor ?? false,
			},
			privacy: {
				profileVisibility: (() => {
					const stored = parsed.privacy?.profileVisibility;
					if (stored === 'public' || stored === 'private') return stored;
					if (stored === 'friends') return 'private';
					return 'public';
				})(),
				showReadActivity: parsed.privacy?.showReadActivity ?? true,
				readReceipts: parsed.privacy?.readReceipts ?? true,
				typingIndicators: parsed.privacy?.typingIndicators ?? true,
				showCloseFriendsBadge: parsed.privacy?.showCloseFriendsBadge ?? true,
				messageRequests: (['everyone', 'followers', 'none'] as MessageRequestsAudience[]).includes(
					parsed.privacy?.messageRequests as MessageRequestsAudience,
				)
					? (parsed.privacy?.messageRequests as MessageRequestsAudience)
					: 'everyone',
			},
			notifications: {
				mention: kindAudience(parsed.notifications?.mention),
				like: kindAudience(parsed.notifications?.like),
				friend_request:
					typeof parsed.notifications?.friend_request === 'boolean' ? parsed.notifications.friend_request : true,
				reply: kindAudience(parsed.notifications?.reply),
				comment: kindAudience(parsed.notifications?.comment),
			},
			mutedSenders: {
				notFollowing: parsed.mutedSenders?.notFollowing ?? false,
				notFollowedBy: parsed.mutedSenders?.notFollowedBy ?? false,
			},
			accessibility: {
				reduceMotion: parsed.accessibility?.reduceMotion ?? false,
				compactDensity: parsed.accessibility?.compactDensity ?? false,
				chatTextSize: snapCheckpoint(CHAT_TEXT_SIZES, parsed.accessibility?.chatTextSize, CHAT_TEXT_SIZE_DEFAULT),
				messageSpacing: snapCheckpoint(MESSAGE_SPACINGS, parsed.accessibility?.messageSpacing, MESSAGE_SPACING_DEFAULT),
				saturation:
					typeof parsed.accessibility?.saturation === 'number' && Number.isFinite(parsed.accessibility.saturation)
						? Math.min(100, Math.max(0, Math.round(parsed.accessibility.saturation / 10) * 10))
						: 100,
			},
			voice: {
				noiseSuppression: parsed.voice?.noiseSuppression ?? true,
				echoCancellation: parsed.voice?.echoCancellation ?? true,
				microphone:
					typeof parsed.voice?.microphone === 'string' && parsed.voice.microphone ? parsed.voice.microphone : 'Default',
				camera: typeof parsed.voice?.camera === 'string' && parsed.voice.camera ? parsed.voice.camera : 'Off',
			},
		};
	} catch {
		return DEFAULT_SETTINGS;
	}
}

function communityIdOf(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const byId = communities.find((entry) => entry.id === value);
	if (byId) return byId.id;
	const byName = communities.find((entry) => entry.name === value);
	return byName ? byName.id : null;
}

function isFeedScope(value: unknown): value is string {
	return (
		value === 'all' ||
		value === 'home' ||
		(typeof value === 'string' && communities.some((entry) => entry.id === value))
	);
}

function channelFor(communityId: string, channels: Record<string, string>): string {
	const community = communities.find((entry) => entry.id === communityId) ?? communities[0];
	const stored = channels[community.id];
	if (stored && community.channels.some((channel) => channel.id === stored)) return stored;
	return community.channels[0]?.id ?? 'general';
}

function loadStoredNumber(key: string, fallback: number, min: number, max: number): number {
	try {
		const saved = Number(localStorage.getItem(key));
		if (Number.isFinite(saved) && saved >= min && saved <= max) return saved;
	} catch {
		console.log(`loadStoredNumber: failed to load ${key} from localStorage, using fallback ${fallback}`);
	}
	return fallback;
}

function saveStored(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {
		console.log(`saveStored: failed to save ${key} to localStorage, value ${value} not persisted`);
	}
}

function loadRecentSearches(): string[] {
	try {
		const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
			.map((entry) => entry.trim().slice(0, 80))
			.slice(0, MAX_RECENT_SEARCHES);
	} catch {
		return [];
	}
}

function loadLastVisited(): LastVisited {
	const fallback: LastVisited = {
		community: communities[0].id,
		channels: {},
		dm: directMessages[0].id,
		feed: 'home',
	};
	try {
		const raw = localStorage.getItem(LAST_VISITED_KEY);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw) as Partial<LastVisited>;
		const community =
			typeof parsed.community === 'string' && parsed.community !== 'all' && parsed.community !== 'home'
				? (communityIdOf(parsed.community) ?? fallback.community)
				: fallback.community;
		const channels: Record<string, string> = {};
		if (parsed.channels && typeof parsed.channels === 'object') {
			for (const [key, id] of Object.entries(parsed.channels)) {
				const ownerId = communityIdOf(key);
				const owner = ownerId ? communities.find((entry) => entry.id === ownerId) : undefined;
				if (owner && typeof id === 'string' && owner.channels.some((channel) => channel.id === id)) {
					channels[owner.id] = id;
				}
			}
		}
		const dm =
			typeof parsed.dm === 'string' && directMessages.some((entry) => entry.id === parsed.dm) ? parsed.dm : fallback.dm;
		const feedScope = typeof parsed.feed === 'string' ? (communityIdOf(parsed.feed) ?? parsed.feed) : parsed.feed;
		return {
			community,
			channels,
			dm,
			feed: isFeedScope(feedScope) ? feedScope : fallback.feed,
		};
	} catch {
		return fallback;
	}
}

const NOTIF_FILTERS = ['all', 'mention', 'like', 'friend_request', 'reply', 'comment'] as const;
const SEARCH_FILTERS = ['post', 'user', 'community'] as const;
const SETTINGS_CATEGORIES = ['account', 'privacy', 'notifications', 'accessibility', 'voice', 'help'] as const;

function App() {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const route = parseWorkspacePath(location.pathname);
	const [lastVisited, setLastVisited] = useState<LastVisited>(loadLastVisited);
	const [feedScope, setFeedScope] = useState(lastVisited.feed);
	const [settingsPrefs, setSettingsPrefs] = useState<SettingsPrefs>(loadSettings);
	const [dmList, setDmList] = useState<DirectMessage[]>(directMessages);
	const [localPosts, setLocalPosts] = useState(posts);
	const [joinedIds, setJoinedIds] = useState<string[]>(() =>
		communities.filter((community) => community.joined).map((community) => community.id),
	);
	const visibleCommunities = useMemo(
		() => communities.map((community) => ({ ...community, joined: joinedIds.includes(community.id) })),
		[joinedIds],
	);
	const toggleJoin = (communityId: string) => {
		setJoinedIds((prev) =>
			prev.includes(communityId) ? prev.filter((id) => id !== communityId) : [...prev, communityId],
		);
	};
	const [searchQueries, setSearchQueries] = useState<Record<WorkspaceMode, string>>({
		feed: '',
		dms: '',
		communities: '',
		notifications: '',
		search: '',
		settings: '',
		profile: '',
	});
	const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches);
	const [composerOpen, setComposerOpen] = useState(false);
	const [activeThread, setActiveThread] = useState<Post | null>(null);
	const [threadVisible, setThreadVisible] = useState(false);
	const threadCloseTimer = useRef<number | null>(null);
	const closingRef = useRef(false);
	const [menu, setMenu] = useState<ContextMenuState | null>(null);
	const modalityRef = useRef<'mouse' | 'keyboard'>('mouse');
	const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
	const [threadWidth, setThreadWidth] = useState<number>(() => loadStoredNumber('thread-width', 400, 280, 720));

	const closeMenu = () => setMenu(null);

	const go = (path: string, overrides: Record<string, string | null> = {}, opts?: { replace?: boolean }) => {
		closeMenu();
		const next = new URLSearchParams();
		if (path === location.pathname) {
			for (const [key, value] of new URLSearchParams(location.search)) next.set(key, value);
		} else if (!('thread' in overrides)) {
			const thread = new URLSearchParams(location.search).get('thread');
			if (thread !== null) next.set('thread', thread);
		}
		for (const [key, value] of Object.entries(overrides)) {
			if (value === null) next.delete(key);
			else next.set(key, value);
		}
		const query = next.toString();
		const target = query ? `${path}?${query}` : path;
		const replace = opts?.replace ?? target === `${location.pathname}${location.search}`;
		navigate(target, { replace });
	};

	const mode: WorkspaceMode = route?.mode ?? 'feed';
	const selfDisplayName = settingsPrefs.account.displayName || currentUser.displayName;
	const selfUsername = settingsPrefs.account.username || currentUser.username.replace(/^@+/, '');
	const routeCommunity =
		route?.mode === 'communities' ? communities.find((entry) => entry.id === route.communityId) : undefined;
	const activeCommunity =
		routeCommunity ?? communities.find((entry) => entry.id === lastVisited.community) ?? communities[0];
	const activeCommunityId = activeCommunity.id;
	const routeChannelId = route?.mode === 'communities' ? route.channelId : undefined;
	const activeChannelId = routeChannelId ?? channelFor(activeCommunity.id, lastVisited.channels);
	const routeDmId = route?.mode === 'dms' ? route.dmId : undefined;
	const activeDmId = routeDmId ?? lastVisited.dm;
	const notifFilterRaw = mode === 'notifications' ? searchParams.get('filter') : null;
	const notifFilter: 'all' | NotificationKind =
		notifFilterRaw && (NOTIF_FILTERS as readonly string[]).includes(notifFilterRaw)
			? (notifFilterRaw as 'all' | NotificationKind)
			: 'all';
	const searchFilterRaw = mode === 'search' ? searchParams.get('filter') : null;
	const searchFilter: SearchFilter =
		searchFilterRaw && (SEARCH_FILTERS as readonly string[]).includes(searchFilterRaw)
			? (searchFilterRaw as SearchFilter)
			: 'post';
	const appliedSearch = mode === 'search' ? (searchParams.get('q') ?? '') : '';
	const categoryRaw = route?.mode === 'settings' ? (route.category ?? 'account') : 'account';
	const settingsCategory: SettingsCategory = (SETTINGS_CATEGORIES as readonly string[]).includes(categoryRaw)
		? (categoryRaw as SettingsCategory)
		: 'account';
	const routeUsername = route?.mode === 'profile' ? route.username : undefined;
	const profileUser: ProfileUser | null =
		route?.mode === 'profile'
			? routeUsername === undefined
				? { name: selfDisplayName, username: selfUsername, isSelf: true }
				: findProfileUser(routeUsername, {
						communities: visibleCommunities,
						directMessages: dmList,
						selfName: selfDisplayName,
						selfUsername,
					})
			: null;
	const threadId = searchParams.get('thread');
	const threadPost = threadId ? (localPosts.find((entry) => entry.id === threadId) ?? null) : null;
	const invalidRoute =
		route === null ||
		(route.mode === 'communities' &&
			(routeCommunity === undefined ||
				(route.channelId !== undefined &&
					!routeCommunity.channels.some((channel) => channel.id === route.channelId)))) ||
		(route.mode === 'dms' && route.dmId !== undefined && !dmList.some((entry) => entry.id === route.dmId)) ||
		(route.mode === 'settings' &&
			route.category !== undefined &&
			!(SETTINGS_CATEGORIES as readonly string[]).includes(route.category)) ||
		(route.mode === 'profile' && route.username !== undefined && profileUser === null) ||
		(notifFilterRaw !== null && !(NOTIF_FILTERS as readonly string[]).includes(notifFilterRaw)) ||
		(searchFilterRaw !== null && !(SEARCH_FILTERS as readonly string[]).includes(searchFilterRaw)) ||
		(threadId !== null && threadPost === null);

	const selectFeedScope = (scope: string) => {
		setFeedScope(scope);
		setLastVisited((prev) => ({ ...prev, feed: scope }));
	};

	const selectCommunity = (communityId: string) => {
		const community = communities.find((entry) => entry.id === communityId) ?? communities[0];
		setLastVisited((prev) => ({ ...prev, community: community.id }));
		go(communityPath(community.id, channelFor(community.id, lastVisited.channels)));
	};

	const selectChannel = (communityId: string, channelId: string) => {
		setLastVisited((prev) => ({
			...prev,
			community: communityId,
			channels: { ...prev.channels, [communityId]: channelId },
		}));
		const community = communities.find((entry) => entry.id === communityId) ?? communities[0];
		go(communityPath(community.id, channelId));
	};

	const selectDm = (dmId: string) => {
		setLastVisited((prev) => ({ ...prev, dm: dmId }));
		go(dmsPath(dmId));
	};

	const openDm = (dmId: string) => {
		selectDm(dmId);
	};

	const openDmWithName = (name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		const member = visibleCommunities
			.flatMap((community) => community.members)
			.find((entry) => entry.name.toLowerCase() === trimmed.toLowerCase());
		if (!member) return;
		setDmList((prev) => {
			if (prev.some((entry) => entry.id === member.id)) return prev;
			return [
				...prev,
				{
					id: member.id,
					name: member.name,
					username: `@${member.name.toLowerCase()}`,
					status: member.status,
					customStatus: '',
					preview: '',
					time: 'now',
				},
			];
		});
		openDm(member.id);
	};

	const commitSearch = (query: string) => {
		const trimmed = query.trim().slice(0, 80);
		if (!trimmed) return;
		setSearchQueries((prev) => ({ ...prev, search: trimmed }));
		setRecentSearches((prev) =>
			[trimmed, ...prev.filter((entry) => entry.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT_SEARCHES),
		);
		go(searchPath(), { q: trimmed, filter: searchFilter === 'post' ? null : searchFilter });
	};

	const clearRecentSearches = () => setRecentSearches([]);

	const resetSearch = () => {
		setSearchQueries((prev) => ({ ...prev, search: '' }));
		go(searchPath(), { q: null }, { replace: true });
	};

	const openChannel = (communityId: string, channelId: string) => {
		selectChannel(communityId, channelId);
	};

	const openProfile = (username: string) => {
		go(profilePath(username));
	};

	const totalUnread = notifications.filter((item) => settingsPrefs.notifications[item.kind]).length;

	const composerDefault = communities.some((community) => community.id === activeCommunityId)
		? activeCommunityId
		: communities.some((community) => community.id === feedScope)
			? feedScope
			: (communities.find((community) => community.joined)?.id ?? communities[0].id);

	const handlePost = (post: Post) => {
		setLocalPosts((prev) => [post, ...prev]);
		setComposerOpen(false);
		go(feedPath());
	};

	// LOCAL-ONLY: removes from in-memory state (no server call yet)
	const handleDeletePost = (post: Post) => {
		setLocalPosts((prev) => prev.filter((entry) => entry.id !== post.id));
		setActiveThread((prev) => (prev && prev.id === post.id ? null : prev));
		if (activeThread && activeThread.id === post.id) {
			setThreadVisible(false);
			go(location.pathname, { thread: null }, { replace: true });
		}
	};

	useEffect(() => {
		const onPointerDown = () => {
			modalityRef.current = 'mouse';
		};
		const onKeyDown = () => {
			modalityRef.current = 'keyboard';
		};
		window.addEventListener('pointerdown', onPointerDown, true);
		window.addEventListener('keydown', onKeyDown, true);
		return () => {
			window.removeEventListener('pointerdown', onPointerDown, true);
			window.removeEventListener('keydown', onKeyDown, true);
		};
	}, []);

	useEffect(() => {
		saveStored(LAST_VISITED_KEY, JSON.stringify(lastVisited));
	}, [lastVisited]);

	useEffect(() => {
		saveStored(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
	}, [recentSearches]);

	useEffect(() => {
		saveStored(SETTINGS_KEY, JSON.stringify(settingsPrefs));
	}, [settingsPrefs]);

	useEffect(() => {
		if (threadId) {
			if (threadPost && (!activeThread || activeThread.id !== threadId)) {
				setActiveThread(threadPost);
				requestAnimationFrame(() => {
					requestAnimationFrame(() => setThreadVisible(true));
				});
			}
		} else if (activeThread && !closingRef.current) {
			setThreadVisible(false);
			setActiveThread(null);
		}
	}, [threadId, threadPost, activeThread]);

	useEffect(() => {
		const needsQuery = mode === 'search';
		const needsFilter = mode === 'notifications' || mode === 'search';
		const hasStrayQuery = searchParams.get('q') !== null && !needsQuery;
		const hasStrayFilter = searchParams.get('filter') !== null && !needsFilter;
		if (!hasStrayQuery && !hasStrayFilter) return;
		const next = new URLSearchParams(location.search);
		if (hasStrayQuery) next.delete('q');
		if (hasStrayFilter) next.delete('filter');
		const query = next.toString();
		navigate(`${location.pathname}${query ? `?${query}` : ''}`, { replace: true });
	}, [location.pathname, location.search, mode, navigate, searchParams]);

	useEffect(() => {
		document.documentElement.classList.toggle('reduce-motion', settingsPrefs.accessibility.reduceMotion);
	}, [settingsPrefs.accessibility.reduceMotion]);

	useEffect(() => {
		const root = document.documentElement;
		root.style.setProperty('--chat-text-size', `${settingsPrefs.accessibility.chatTextSize}px`);
		root.style.setProperty('--message-spacing', `${settingsPrefs.accessibility.messageSpacing}px`);
		root.style.setProperty('--saturation', `${settingsPrefs.accessibility.saturation}%`);
		root.classList.toggle('saturation-fx', settingsPrefs.accessibility.saturation !== 100);
	}, [
		settingsPrefs.accessibility.chatTextSize,
		settingsPrefs.accessibility.messageSpacing,
		settingsPrefs.accessibility.saturation,
	]);

	const updateSettings = <K extends keyof SettingsPrefs>(section: K, patch: Partial<SettingsPrefs[K]>) => {
		setSettingsPrefs((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
	};

	const openMenu = (x: number, y: number, items: ContextMenuItem[], invoker: HTMLElement | null, toggle = false) => {
		setMenu((prev) =>
			toggle && prev && invoker !== null && prev.invoker === invoker
				? null
				: { x, y, items, invoker, keyboard: modalityRef.current === 'keyboard', toggle },
		);
	};

	const openThread = (post: Post) => {
		if (threadCloseTimer.current !== null) {
			window.clearTimeout(threadCloseTimer.current);
			threadCloseTimer.current = null;
		}
		closingRef.current = false;
		setActiveThread(post);
		requestAnimationFrame(() => {
			requestAnimationFrame(() => setThreadVisible(true));
		});
		go(location.pathname, { thread: post.id });
	};

	const closeThread = () => {
		setThreadVisible(false);
		closingRef.current = true;
		if (threadCloseTimer.current !== null) {
			window.clearTimeout(threadCloseTimer.current);
		}
		go(location.pathname, { thread: null }, { replace: true });
		threadCloseTimer.current = window.setTimeout(() => {
			setActiveThread(null);
			closingRef.current = false;
			threadCloseTimer.current = null;
		}, 200);
	};

	const toggleThread = (post: Post) => {
		if (activeThread && activeThread.id === post.id) {
			closeThread();
		} else {
			openThread(post);
		}
	};

	const handleThreadWidth = (width: number) => {
		const clamped = Math.round(Math.min(threadMaxWidth, Math.max(280, width)));
		setThreadWidth(clamped);
		saveStored('thread-width', String(clamped));
	};

	useEffect(() => {
		const onResize = () => setWindowWidth(window.innerWidth);
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	// Rail (84) + sidebar (320) + content padding (48) + full post width (760)
	// The panel stops growing before posts would have to shrink
	const threadMaxWidth = Math.max(280, windowWidth - 1212);
	const clampedThreadWidth = Math.min(threadWidth, threadMaxWidth);

	const closeThreadNow = () => {
		if (threadCloseTimer.current !== null) {
			window.clearTimeout(threadCloseTimer.current);
			threadCloseTimer.current = null;
		}
		setThreadVisible(false);
		setActiveThread(null);
	};

	return invalidRoute ? (
		<NotFound />
	) : (
		<div className="home-shell">
			<WorkspaceRail
				mode={mode}
				totalUnread={totalUnread}
				displayName={selfDisplayName}
				username={selfUsername}
				onChangeMode={(nextMode) => {
					if (nextMode === 'feed') {
						setFeedScope(lastVisited.feed);
						go(feedPath(), { thread: null });
					} else if (nextMode === 'communities') {
						const community = communities.find((entry) => entry.id === lastVisited.community) ?? communities[0];
						go(communityPath(community.id, channelFor(community.id, lastVisited.channels)), { thread: null });
					} else if (nextMode === 'dms') {
						go(dmsPath(lastVisited.dm), { thread: null });
					} else if (nextMode === 'notifications') {
						go(notificationsPath(), { thread: null });
					} else if (nextMode === 'search') {
						go(searchPath(), { thread: null });
					} else if (nextMode === 'profile') {
						go(profilePath(), { thread: null });
					} else {
						go(settingsPath(), { thread: null });
					}
					closeThreadNow();
					closeMenu();
				}}
				onCompose={() => setComposerOpen(true)}
			/>

			<div
				className={`workspace-frame${mode === 'communities' ? ' narrow-sidebar' : ''}${mode === 'profile' ? ' no-sidebar' : ''}`}
			>
				{mode !== 'profile' && (
					<WorkspaceSidebar
						mode={mode}
						communities={visibleCommunities}
						directMessages={dmList}
						activeCommunityId={activeCommunityId}
						activeDmId={activeDmId}
						feedScope={feedScope}
						onSelectFeedScope={selectFeedScope}
						onSelectCommunity={selectCommunity}
						onSelectChannel={selectChannel}
						notifFilter={notifFilter}
						onSelectNotifFilter={(filter) => go(notificationsPath(), { filter: filter === 'all' ? null : filter })}
						onSelectDm={selectDm}
						searchQuery={searchQueries[mode]}
						onSearchQuery={(query) => setSearchQueries((prev) => ({ ...prev, [mode]: query }))}
						searchFilter={searchFilter}
						onSelectSearchFilter={(filter) => go(searchPath(), { filter: filter === 'post' ? null : filter })}
						recentSearches={recentSearches}
						onCommitSearch={commitSearch}
						onClearRecentSearches={clearRecentSearches}
						settingsCategory={settingsCategory}
						onSelectSettingsCategory={(category) => go(settingsPath(category))}
					/>
				)}

				<WorkspaceContent
					mode={mode}
					communities={visibleCommunities}
					posts={localPosts}
					directMessages={dmList}
					activeCommunityId={activeCommunityId}
					activeChannelId={activeChannelId}
					activeDmId={activeDmId}
					feedScope={feedScope}
					onOpenChannel={openChannel}
					notifFilter={notifFilter}
					onOpenThread={toggleThread}
					onOpenProfile={openProfile}
					onOpenCommunity={selectCommunity}
					onDeletePost={handleDeletePost}
					profileUser={profileUser}
					threadShift={threadVisible ? clampedThreadWidth : 0}
					openMenu={openMenu}
					searchQuery={searchQueries[mode]}
					onResetSearch={resetSearch}
					searchFilter={searchFilter}
					appliedSearchQuery={appliedSearch}
					onOpenDm={openDm}
					onOpenDmWithName={openDmWithName}
					onToggleJoin={toggleJoin}
					settingsCategory={settingsCategory}
					settingsPrefs={settingsPrefs}
					onUpdateSettings={updateSettings}
				/>

				{activeThread && (
					<div className={`thread-wrap${threadVisible ? ' open' : ''}`} style={{ width: clampedThreadWidth }}>
						<ThreadPanel
							post={activeThread}
							communityName={communities.find((entry) => entry.id === activeThread.community)?.name ?? ''}
							onClose={closeThread}
							width={clampedThreadWidth}
							maxWidth={threadMaxWidth}
							onResizeWidth={handleThreadWidth}
							openMenu={openMenu}
						/>
					</div>
				)}
			</div>
			{composerOpen && (
				<PostModal
					communities={visibleCommunities}
					defaultCommunity={composerDefault}
					onClose={() => setComposerOpen(false)}
					onPost={handlePost}
				/>
			)}
			{menu && <ContextMenu menu={menu} onClose={closeMenu} />}
		</div>
	);
}

export default App;
