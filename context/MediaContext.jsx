import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as MediaLibrary from 'expo-media-library/legacy';
import { File, Paths } from 'expo-file-system';

const MediaContext = createContext(null);
const PAGE_SIZE = 60;
const FIRST_PAGE = 30; // what the splash waits for
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

            const checked = await Promise.all(
                all.map(async (album) => {
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
                })
            );

            const result = checked.filter(Boolean);
            setAlbums(result);
            saveCache({ albums: result });
        } catch (e) {
            console.warn('Failed to load albums', e);
        }
    }, []);

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
            const cached = await readCache();
            if (cached && !cancelled) {
                setLists((prev) => ({ ...prev, all: cached.assets }));
                setAlbums(cached.albums);
                setReady(true); // splash hides now, with the last known state on screen
            }
            await refresh(); // fresh data replaces the cached data
            if (!cancelled) setReady(true); // first launch ever: no cache, so wait for this
            loadAlbums(); // not awaited
        })();

        return () => { cancelled = true; };
    }, [permission?.granted, refresh, loadAlbums]);

    const value = useMemo(
        () => ({ permission, requestPermission, ready, albums, lists, loadMore }),
        [permission, requestPermission, ready, albums, lists, loadMore]
    );

    return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export const useMedia = () => useContext(MediaContext);

// assets for the whole library (no argument) or for one album
export function useAssets(albumId) {
    const { permission, lists, loadMore } = useMedia();
    const key = albumId ?? 'all';

    // opening an album for the first time loads its first page
    useEffect(() => {
        if (permission?.granted && !lists[key]) loadMore(albumId);
    }, [permission?.granted, key]);

    return {
        assets: lists[key] ?? [],
        loadMore: () => loadMore(albumId),
    };
}