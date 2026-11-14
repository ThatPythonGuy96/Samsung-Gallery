import { memo } from 'react';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';

const AlbumCard = ({ item, size }) => {
    return (
        <Link href={`/album/${item.id}`} asChild>
            <Pressable style={{ padding: 6, width: size }}>
                <Image
                    source={item.cover}
                    style={styles.image}
                    contentFit="cover"
                    decodeFormat="rgb"
                    cachePolicy="memory-disk"
                    recyclingKey={item.id}
                    transition={0}
                />
                <Text style={styles.albumName} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                <Text style={styles.itemCount}>{item.assetCount}</Text>
            </Pressable>
        </Link>
    );
};

export default memo(AlbumCard);

const styles = StyleSheet.create({
    albumName: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        borderStyle: 'solid',
        borderWidth: .2,
        borderColor: '#c2c1c1',
        borderRadius: 10,
        backgroundColor: '#1c1c1e',
    },
    itemCount: {
        color: 'white',
        fontSize: 13,
        fontWeight: '100',
    },
});
