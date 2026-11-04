import { Link } from 'expo-router'
import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

const AlbumCard = ({ item, size }) => {
    return (
        <Link href={`../album/${item.id}`} asChild>
            <Pressable style={{ padding: 6, width: size }}>
                <Image style={styles.image} source={{ uri: item.cover }} />
                <Text style={styles.albumName} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                <Text style={styles.itemCount}>{item.assetCount}</Text>
            </Pressable>
        </Link>
    )
}

export default memo(AlbumCard)

const styles = StyleSheet.create({
    albumName: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        width: 70
    },
    image: {
        width: '100%', 
        aspectRatio: 1, 
        borderStyle: 'solid', 
        borderWidth: .2, 
        borderColor: '#c2c1c1',
        borderRadius: 10,
    },
    itemCount: { 
        color: 'white',
        fontSize: 13,
        fontWeight: '100'
    }
})