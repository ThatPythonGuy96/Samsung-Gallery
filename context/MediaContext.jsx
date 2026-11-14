import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as MediaLibrary from 'expo-media-library/legacy';
import { File, Paths } from 'expo-file-system';
import { enqueueThumbnails, initThumbnails } from '../utils/thumbnails';
import { initActions, purgeExpired, useTrashedIds } from '../utils/actions';

const MediaContext = createContext(null);

const PAGE_SIZE = 60;
const FIRST_PAGE = 35; // what the splash waits for
const ALBUM_BATCH = 8; // album folders checked in parallel
const EMPTY = []; // stable reference, so memoized lists don't re-render for nothing

const CACHE_VERSION = 1; // bump if the shape of cached data ever changes
const cacheFile = new File(Paths.cache, 'media-cache.json');

async function readCache() {
    try {
        if (!cacheFile.exists) return null;
        const data = JSON.parse(await cacheFile.text());
        return data.version === CACHE_VERSION ? data : null;
    } catch {
        return null;
    }
}

function writeCache(data) {
    try {
        if (!cacheFile.exists) cacheFile.create();
        cacheFile.write(JSON.stringify({ version: CACHE_VERSION, ...data }));
    } catch (e) {
        console.warn('Failed to write cache', e);
    }
}

export function MediaProvider({ children }) {
    const [permission, requestPermission] = MediaLibrary.usePermissions();
    const [ready, setReady] = useState(false);
    const [lists, setLists] = useState({}); // { all: [...], [albumId]: [...] }
    const [albums, setAlbums] = useState([]);
    const meta = useRef({}); // { [key]: { after, hasMore, loading } }
    const cache = useRef({ assets: [], albums: [] });

    const saveCache = useCallback((patch) => {
        cache.current = { ...cache.current, ...patch };
        writeCache(cache.current);
    }, []);

    const loadMore = useCallback(async (albumId) => {
        const key = albumId ?? 'all';
        const m = (meta.current[key] ??= { after: undefined, hasMore: true, loading: false });
        if (m.loading || !m.hasMore) return;
        m.loading = true;
        try {
            const page = await MediaLibrary.getAssetsAsync({
                first: m.after ? PAGE_SIZE : FIRST_PAGE,
                after: m.after,
                album: albumId, // undefined = whole library
                mediaType: ['photo', 'video'],
                sortBy: [[MediaLibrary.SortBy.creationTime, false]],
            });
            m.after = page.endCursor;
            m.hasMore = page.hasNextPage;
            setLists((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), ...page.assets] }));
        } catch (e) {
            console.warn('Failed to load media', e);
        } finally {
            m.loading = false;
        }
    }, []);

    const loadAlbums = useCallback(async () => {
        try {
            const all = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });

            const check = async (album) => {
                const page = await MediaLibrary.getAssetsAsync({
                    album: album.id,
                    first: 1,
                    mediaType: ['photo', 'video'],
                    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
                });
                if (page.totalCount === 0) return null; // music-only folder etc.
                return {
                    ...album,
                    assetCount: page.totalCount, // photos and videos only
                    cover: page.assets[0]?.uri,
                };
            };

            // a few folders at a time: one query per folder all at once is heavy on Android
            const result = [];
            for (let i = 0; i < all.length; i += ALBUM_BATCH) {
                const chunk = await Promise.all(all.slice(i, i + ALBUM_BATCH).map(check));
                result.push(...chunk.filter(Boolean));
            }

            setAlbums(result);
            saveCache({ albums: result });
        } catch (e) {
            console.warn('Failed to load albums', e);
        }
    }, [saveCache]);

    const refresh = useCallback(async () => {
        const m = (meta.current.all ??= { after: undefined, hasMore: true, loading: false });
        m.loading = true; // loadMore('all') waits, so cached and fresh pages can't duplicate
        try {
            const page = await MediaLibrary.getAssetsAsync({
                first: FIRST_PAGE,
                mediaType: ['photo', 'video'],
                sortBy: [[MediaLibrary.SortBy.creationTime, false]],
            });
            m.after = page.endCursor;
            m.hasMore = page.hasNextPage;
            setLists((prev) => ({ ...prev, all: page.assets }));
            saveCache({ assets: page.assets });
        } catch (e) {
            console.warn('Failed to refresh media', e);
        } finally {
            m.loading = false;
        }
    }, [saveCache]);

    useEffect(() => {
        if (!permission) return; // still checking
        if (!permission.granted) {
            setReady(true);
            return;
        }

        let cancelled = false;
        (async () => {
            initActions(); // favorites and the recycle bin, before anything is shown
            initThumbnails(); // which thumbnails already exist, before any tile renders

            const cached = await readCache();
            if (cached && !cancelled) {
                setLists((prev) => ({ ...prev, all: cached.assets }));
                setAlbums(cached.albums);
                setReady(true); // splash hides now, with the last known state on screen
            }
            await refresh(); // fresh data replaces the cached data
            if (!cancelled) setReady(true); // first launch ever: no cache, so wait for this
            loadAlbums(); // not awaited
            purgeExpired(); // items older than 30 days in the bin; Android asks to confirm
        })();

        return () => { cancelled = true; };
    }, [permission?.granted, refresh, loadAlbums]);

    // after copy / move the library has changed: start again from fresh data
    const reload = useCallback(async () => {
        meta.current = {};
        setLists((prev) => (prev.all ? { all: prev.all } : {})); // album lists reload when opened
        await refresh();
        loadAlbums();
    }, [refresh, loadAlbums]);

    // background thumbnails for everything that has been loaded, newest first
    useEffect(() => {
        for (const list of Object.values(lists)) enqueueThumbnails(list);
    }, [lists]);

    const value = useMemo(
        () => ({ permission, requestPermission, ready, albums, lists, loadMore, reload }),
        [permission, requestPermission, ready, albums, lists, loadMore, reload]
    );

    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export const useMedia = () => useContext(MediaContext);

// assets for the whole library (no argument) or for one album
export function useAssets(albumId) {
    const { permission, lists, loadMore, ready } = useMedia();
    const trashedIds = useTrashedIds();
    const key = albumId ?? 'all';
    const raw = lists[key];

    // opening an album for the first time (or after a reload) loads its first page
    useEffect(() => {
        if (permission?.granted && !raw) loadMore(albumId);
    }, [permission?.granted, key, !!raw]);

    // media in the recycle bin never show up in the app
    const assets = useMemo(() => {
        if (!raw) return EMPTY;
        return trashedIds.size ? raw.filter((a) => !trashedIds.has(a.id)) : raw;
    }, [raw, trashedIds]);

    // stable identity: lists and onEndReached don't see a "new" function every render
    const load = useCallback(() => loadMore(albumId), [loadMore, albumId]);

    return {
        assets,
        loadMore: load,
        ready: ready && !!raw,
    };
}
