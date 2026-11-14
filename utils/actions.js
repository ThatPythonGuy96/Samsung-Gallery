import { useMemo, useSyncExternalStore } from 'react';
import { Alert, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library/legacy';

// Favorite, delete (recycle bin), copy and move.
//
// Favorites and the bin are tiny stores saved as JSON files in the app's documents
// folder. Screens subscribe to them with the hooks at the bottom of each section,
// so no provider is needed. Call initActions() once at startup.

export const RETENTION_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

const favoritesFile = new File(Paths.document, 'favorites.json');
const trashFile = new File(Paths.document, 'trash.json');

// ---------------------------------------------------------------- helpers

function createStore(initial) {
	let state = initial;
	const listeners = new Set();
	return {
		get: () => state,
		set: (next) => {
			state = next;
			listeners.forEach((l) => l());
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}

function readJson(file, fallback) {
	try {
		if (!file.exists) return fallback;
		return JSON.parse(file.textSync());
	} catch {
		return fallback; // unreadable or corrupted file
	}
}

function writeJson(file, value) {
	try {
		if (!file.exists) file.create();
		file.write(JSON.stringify(value));
	} catch (e) {
		console.warn('Failed to save', file.uri, e);
	}
}

const favorites = createStore(new Set()); // Set of asset ids
const trash = createStore({ entries: {}, ids: new Set() }); // entries: { [id]: { trashedAt, asset } }

let initialised = false;

// Reads both files. Safe to call more than once.
export function initActions() {
	if (initialised) return;
	initialised = true;

	const fav = readJson(favoritesFile, []);
	favorites.set(new Set(Array.isArray(fav) ? fav : []));

	const saved = readJson(trashFile, {});
	const entries = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
	trash.set({ entries, ids: new Set(Object.keys(entries)) });
}

// ---------------------------------------------------------------- favorite

export const isFavorite = (id) => favorites.get().has(id);

// returns the new state: true = now a favorite
export function toggleFavorite(id) {
	const next = new Set(favorites.get());
	const nowFavorite = !next.has(id);
	if (nowFavorite) next.add(id);
	else next.delete(id);

	favorites.set(next);
	writeJson(favoritesFile, [...next]);
	return nowFavorite;
}

function forgetFavorites(ids) {
	const current = favorites.get();
	if (!ids.some((id) => current.has(id))) return;
	const next = new Set(current);
	ids.forEach((id) => next.delete(id));
	favorites.set(next);
	writeJson(favoritesFile, [...next]);
}

export const useIsFavorite = (id) =>
	useSyncExternalStore(favorites.subscribe, () => favorites.get().has(id));

export const useFavoriteIds = () => useSyncExternalStore(favorites.subscribe, favorites.get);

// ---------------------------------------------------------------- delete (recycle bin)

function setTrash(entries) {
	trash.set({ entries, ids: new Set(Object.keys(entries)) });
	writeJson(trashFile, entries);
}

// keep only what the bin screen needs to show an item
const snapshot = (a) => ({
	id: a.id,
	uri: a.uri,
	mediaType: a.mediaType,
	duration: a.duration,
	width: a.width,
	height: a.height,
	creationTime: a.creationTime,
	modificationTime: a.modificationTime,
	filename: a.filename,
});

// "Delete": hides the media everywhere in the app and keeps it in the bin for
// RETENTION_DAYS. The file itself stays where it is until it is deleted for good.
export function deleteMedia(assets) {
	const now = Date.now();
	const entries = { ...trash.get().entries };
	for (const a of assets) entries[a.id] = { trashedAt: now, asset: snapshot(a) };
	setTrash(entries);
}

// Puts media back (they reappear in the grids straight away).
export function restoreMedia(ids) {
	const entries = { ...trash.get().entries };
	ids.forEach((id) => delete entries[id]);
	setTrash(entries);
}

// Deletes the files for good. Android asks the user to confirm, so this can
// resolve to false when they decline; nothing is removed from the bin then.
export async function deleteForever(ids) {
	if (!ids.length) return true;
	try {
		const ok = await MediaLibrary.deleteAssetsAsync(ids);
		if (!ok) return false;

		const entries = { ...trash.get().entries };
		ids.forEach((id) => delete entries[id]);
		setTrash(entries);
		forgetFavorites(ids);
		return true;
	} catch (e) {
		console.warn('Delete failed', e);
		return false;
	}
}

export const emptyTrash = () => deleteForever(Object.keys(trash.get().entries));

// Permanently deletes whatever has been in the bin for RETENTION_DAYS.
export function purgeExpired() {
	const cutoff = Date.now() - RETENTION_DAYS * DAY;
	const expired = Object.entries(trash.get().entries)
		.filter(([, e]) => e.trashedAt < cutoff)
		.map(([id]) => id);
	return deleteForever(expired);
}

// ids of everything in the bin, for hiding it from lists
export const useTrashedIds = () => useSyncExternalStore(trash.subscribe, () => trash.get().ids);

// the bin as a list (newest first), each item with daysLeft
export function useTrash() {
	const entries = useSyncExternalStore(trash.subscribe, () => trash.get().entries);
	return useMemo(() => {
		const now = Date.now();
		return Object.values(entries)
			.map((e) => ({
				...e.asset,
				trashedAt: e.trashedAt,
				daysLeft: Math.max(0, Math.ceil((e.trashedAt + RETENTION_DAYS * DAY - now) / DAY)),
			}))
			.sort((a, b) => b.trashedAt - a.trashedAt);
	}, [entries]);
}

// ---------------------------------------------------------------- copy / move

// assets: an array of assets (or ids). album: an album (or its id).
// Afterwards the library has changed, so reload the lists (useMedia().reload).

export async function copyToAlbum(assets, album) {
	try {
		return await MediaLibrary.addAssetsToAlbumAsync(assets, album, true);
	} catch (e) {
		console.warn('Copy failed', e);
		return false;
	}
}

// On Android this really moves the files (the user is asked to confirm on Android 11+).
// On iOS an asset can live in several albums, so pass fromAlbum to take it out of the old one.
export async function moveToAlbum(assets, album, fromAlbum) {
	try {
		const ok = await MediaLibrary.addAssetsToAlbumAsync(assets, album, false);
		if (ok && Platform.OS === 'ios' && fromAlbum) {
			await MediaLibrary.removeAssetsFromAlbumAsync(assets, fromAlbum);
		}
		return ok;
	} catch (e) {
		console.warn('Move failed', e);
		return false;
	}
}

// -----------------------------------------

export async function copyToClipboard() {
	Alert('Copied to clipboard')
};

export async function viewInfo() {
	Alert('Detail')
};