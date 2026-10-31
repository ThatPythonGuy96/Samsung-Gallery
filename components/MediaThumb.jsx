// components/MediaThumb.jsx
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Lucide } from '@react-native-vector-icons/lucide';

const pad = (n) => String(n).padStart(2, '0');

const formatDuration = (seconds = 0) => {
    const total = Math.round(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const MediaThumb = ({ item, size, albumId }) => {
    const isVideo = item.mediaType === 'video';
    const route = isVideo ? 'video' : 'photo';
    const href = albumId
        ? `/${route}/${item.id}?album=${albumId}`
        : `/${route}/${item.id}`;

    return (
        <Link href={href} asChild>
            <Pressable style={{ width: size, height: size }}>
                <Image source={{ uri: item.uri }} style={styles.image} />

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
    image: { width: '100%', height: '100%' },
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