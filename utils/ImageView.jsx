import { memo } from 'react';
import { Image } from 'expo-image';
import { thumbUri } from '../utils/thumbnails';

// Full-screen page. The grid thumbnail shows instantly as a placeholder,
// then the full-resolution photo fades in over it (Google Photos does the same).
// fullRes: decode at the photo's real size instead of screen size, so zoom stays sharp.
const ImageView = ({ item, width, height = '100%', fullRes = false, onLoad }) => {
    const thumb = thumbUri(item);

    return (
        <Image
            source={item.uri}
            placeholder={thumb ? { uri: thumb } : undefined}
            placeholderContentFit="contain"
            style={{ width, height }}
            contentFit="contain"
            transition={150}
            cachePolicy="memory"
            recyclingKey={item.id}
            allowDownscaling={!fullRes}
            onLoad={onLoad}
        />
    );
};

export default memo(ImageView);
