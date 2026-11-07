import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Blurhash } from 'react-native-blurhash';
import { Lucide } from '@react-native-vector-icons/lucide';

const pad = (n) => String(n).padStart(2, '0');

const formatDuration = (seconds = 0) => {
    const total = Math.round(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const MediaThumb = ({ item, size, albumId, ready }) => {
    const isVideo = item.mediaType === 'video';
    const href = albumId ? `/media/${item.id}?album=${albumId}` : `/media/${item.id}`;

    return (
        <Link href={href} asChild>
            <Pressable style={{ width: size, height: size }}>
                {!ready && item.blurHash ? (
                    <Blurhash
                        blurhash={item.blurHash}
                        style={{ width: '100%', height: '100%' }}
                    />
                ) : null}
                <Image 
                    source={{ uri: item.uri }}
                    style={styles.image} 
                    decodeFormat="rgb"
                    cachePolicy="memory-disk"
                    contentFit="contain"
                    autoplay={true}
                    placeholder={require('../assets/placeholder.png')}
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
    image: { 
        width: '100%', 
        aspectRatio: 1, 
        borderStyle: 'solid', 
        borderWidth: .2, 
        borderColor: '#fff' 
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