import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Lucide } from '@react-native-vector-icons/lucide';
import { thumbUri } from '../utils/thumbnails';
import { formatDuration } from '../utils/format';

// size = the visible tile, gap = space around it (half on each side)
const MediaThumb = ({ item, size, gap = 0, albumId }) => {
    const isVideo = item.mediaType === 'video';
    const href = albumId ? `/media/${item.id}?album=${albumId}` : `/media/${item.id}`;

    // the small cached copy when it exists, otherwise the original
    const uri = useMemo(() => thumbUri(item) ?? item.uri, [item]);

    const tileStyle = useMemo(
        () => StyleSheet.flatten([styles.tile, { width: size, height: size, margin: gap / 2 }]),
        [size, gap]
    );

    return (
        <Link href={href} asChild>
            <Pressable style={tileStyle}>
                <Image
                    source={uri}
                    style={styles.image}
                    contentFit="cover"
                    decodeFormat="rgb"
                    cachePolicy="memory-disk"
                    recyclingKey={item.id}
                    transition={0}
                    autoplay={false}
                />

                {isVideo && (
                    <View style={styles.badge}>
                        <Lucide name="play" size={10} color="#fff" />
                        <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
                    </View>
                )}
            </Pressable>
        </Link>
    );
};

// memo: the grid re-renders as pages load, but existing tiles don't change
export default memo(MediaThumb);

const styles = StyleSheet.create({
    tile: { backgroundColor: '#1c1c1e' }, // plain placeholder while the image decodes
    image: {
        width: '100%',
        height: '100%',
        borderStyle: 'solid',
        borderWidth: .2,
        borderColor: '#fff',
    },
    badge: {
        position: 'absolute',
        right: 4,
        bottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    duration: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
