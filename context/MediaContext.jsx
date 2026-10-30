// context/MediaContext.js
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as MediaLibrary from 'expo-media-library/legacy';

const MediaContext = createContext(null);
const PAGE_SIZE = 60;

export function MediaProvider({ children }) {
    const [permission, requestPermission] = MediaLibrary.usePermissions();
    const [lists, setLists] = useState({}); // { all: [...], [albumId]: [...] }
    const [albums, setAlbums] = useState([]);
    const meta = useRef({}); // { [key]: { after, hasMore, loading } }

    const loadMore = useCallback(async (albumId) => {
        const key = albumId ?? 'all';
        const m = (meta.current[key] ??= { after: undefined, hasMore: true, loading: false });
        if (m.loading || !m.hasMore) return;
        m.loading = true;
        try {
            const page = await MediaLibrary.getAssetsAsync({
                first: PAGE_SIZE,
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

            setAlbums(checked.filter(Boolean));
        } catch (e) {
            console.warn('Failed to load albums', e);
        }
    }, []);

    useEffect(() => {
        if (permission?.granted) {
            loadMore();
            loadAlbums();
        }
    }, [permission?.granted, loadMore, loadAlbums]);

    const value = useMemo(
        () => ({ permission, requestPermission, albums, lists, loadMore }),
        [permission, requestPermission, albums, lists, loadMore]
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