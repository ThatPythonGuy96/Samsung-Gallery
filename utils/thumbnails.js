import { Directory, File, Paths } from 'expo-file-system';

// A small cached JPEG for every photo (the article's "mipmap"), so the grids
// never have to decode full-size originals. Generated in the background,
// newest photos first, and kept between launches.

const THUMB_SIZE = 384; // px, shorter side; enough for a 2-column grid
const MIN_SOURCE = THUMB_SIZE * 1.5; // smaller photos are already cheap to decode
const MAX_FAILURES = 5; // give up if generation keeps failing

const dir = new Directory(Paths.cache, 'thumbs');
const ready = new Map(); // key -> uri of a finished thumbnail
const queued = new Set(); // keys waiting or in progress
const queue = [];
let running = false;
let failures = 0;

// the key changes when a photo is edited, so stale thumbnails are never reused
const keyOf = (a) =>
	`${String(a.id).replace(/[^a-zA-Z0-9_-]/g, '_')}_${Math.round(a.modificationTime || 0)}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const eligible = (a) => {
	if (a.mediaType !== 'photo') return false;
	if (/\.gif$/i.test(a.filename || '')) return false; // a JPEG would lose the animation
	if (a.width && a.height) return Math.min(a.width, a.height) > MIN_SOURCE;
	return true;
};

// Read which thumbnails already exist: one directory listing, not one check per photo.
export function initThumbnails() {
	try {
		if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
		for (const entry of dir.list()) {
			const name = entry.uri.split('/').pop();
			if (name && name.endsWith('.jpg')) ready.set(name.slice(0, -4), entry.uri);
		}
	} catch (e) {
		console.warn('Thumbnail index failed', e);
	}
}

// Synchronous lookup, safe to call while rendering. Null means "use the original".
export const thumbUri = (asset) => ready.get(keyOf(asset)) ?? null;

async function generate(asset) {
	const key = keyOf(asset);
	let image;
	try {
		// required lazily so the app keeps running until the native module is in your build
		const { ImageManipulator, SaveFormat } = require('expo-image-manipulator');
		const portrait = asset.width && asset.height && asset.width < asset.height;

		const context = ImageManipulator.manipulate(asset.uri);
		context.resize(portrait ? { width: THUMB_SIZE } : { height: THUMB_SIZE });
		image = await context.renderAsync();
		const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.7 });

		// move() is asynchronous in SDK 57: wait for it before the thumbnail is used
		const target = new File(dir, `${key}.jpg`);
		await new File(result.uri).move(target, { overwrite: true });

		ready.set(key, target.uri);
		failures = 0;
	} catch (e) {
		failures += 1;
		console.warn('Thumbnail failed', asset.id, e?.message ?? e);
	} finally {
		image?.release();
		queued.delete(key);
	}
}

async function run() {
	if (running) return;
	running = true;
	try {
		while (queue.length && failures < MAX_FAILURES) {
			await generate(queue.shift());
			await sleep(30); // let the UI breathe between photos
		}
	} finally {
		running = false;
	}
}

// Queue photos for background thumbnail generation (duplicates are ignored).
export function enqueueThumbnails(assets) {
	if (failures >= MAX_FAILURES) return;
	for (const a of assets) {
		const key = keyOf(a);
		if (ready.has(key) || queued.has(key) || !eligible(a)) continue;
		queued.add(key);
		queue.push(a);
	}
	run();
}
