# Gallery

Gallery is a mobile photo and video browser built with React Native and Expo. It reads media from the device library and provides browsable photo grids, albums, and a full-screen viewer.

## Features

- Browse device photos and videos in a paginated grid, sorted newest first.
- Browse device albums and open an album to view its media.
- View photos and play videos full-screen; swipe between items or select one from the thumbnail strip.
- Adjust grid density with a pinch gesture on the Pictures, Albums, and album screens.
- Use a floating tab bar to switch between Pictures, Albums, and Settings.
- View and request photo-library permission in the app. A small on-device cache restores the initial library page and album list while fresh results load.
- Remember grid layout and the last selected tab between launches.

## Tech stack

- Expo SDK 57 and React Native 0.86
- Expo Router for file-based navigation
- Expo Media Library for device photos, videos, albums, and permission handling
- Expo Video for video playback
- React Native Gesture Handler and Reanimated for gestures and animation
- Expo File System for local media-cache and settings files

## Getting started

Install dependencies and start the Expo development server:

```bash
npm install
npx expo start
```

Use the Expo CLI prompts to open the app on a device or emulator. The project also provides `npm run android`, `npm run ios`, and `npm run web` scripts. Device-library browsing and playback are intended for native iOS and Android; web may not provide the same media-library functionality. An iOS simulator requires macOS.

Grant photo-library access when prompted. If access is denied, use the Settings tab to request permission again or open the device settings.

## App structure

```text
app/                  Expo Router screens and layouts
  (tabs)/              Pictures, Albums, and Settings tabs
  album/[id].jsx       Album media grid
  media/[id].jsx       Photo and video viewer
components/            Reusable album, media, action-bar, and tab-bar UI
context/               Media-library and settings state
hooks/                 Pinch-to-adjust grid columns
utils/                 Date grouping and video playback helper
```

## Notes and limitations

- Photo and video access depends on granting the app permission to the device library.
- Favorites are held in memory only and reset when the viewer is closed.
- Edit and share actions are not implemented. Delete currently displays a confirmation and exits the viewer without deleting the device asset; the info action only displays a basic alert.
- Album search and overflow controls are visual placeholders.
- The Settings screen currently focuses on media-library permission status; it does not expose the saved grid-layout preferences.

## License

See [LICENSE](LICENSE).
