# Gallery

Gallery is a photo gallery app built with React Native and Expo. It provides a mobile-first interface for browsing a photo grid, viewing images, and navigating between photo collections.

> **Project status:** This is a UI prototype. Photos and albums are bundled sample data; the app does not currently load or manage the device's photo library.

## Features

- Browse a four-column grid of 50 bundled sample photos.
- Open a photo in a full-screen viewer and move between images using the thumbnail strip.
- Browse sample albums and view the photos assigned to each album.
- Use a custom floating tab bar to switch between Pictures, Albums, and Settings.
- Try the photo viewer's pinch gesture and action bar. Favorite state is temporary and resets when the viewer is left.
- Run the Expo app on Android, iOS, or the web.

## Tech stack

- Expo SDK 57 and React Native 0.86
- Expo Router for file-based navigation
- React Native Gesture Handler and Reanimated for gestures and animation
- Expo Media Library is included as a dependency and configured for permissions, but device-library integration is not implemented yet.

## Getting started

Install dependencies, then start the Expo development server:

```bash
npm install
npx expo start
```

Use the Expo CLI prompts to open the app in a development build or emulator. You can also start a platform-specific target with `npm run android`, `npm run ios`, or `npm run web`.

## App structure

```text
app/                 Expo Router screens and layouts
	(tabs)/             Pictures, Albums, and Settings tabs
	album/[name].jsx    Album photo grid
	photo/[id].jsx      Photo viewer
	video/[id].jsx      Video screen placeholder
components/           Reusable album, photo-action, and tab-bar UI
assets/photos/        Bundled sample images
data.js               Local photo and album data
```

## Current limitations

- The gallery uses local image assets in `assets/photos/` and static entries in `data.js`; it does not request permission or query device media yet.
- The photo action bar is mostly UI scaffolding: edit, share, and info are not implemented, and delete currently confirms then returns without deleting an asset.
- Albums are sample data rather than device albums. The Albums screen's plus icon and Settings links are placeholders.
- The video route is currently a placeholder.

## License

See [LICENSE](LICENSE).
