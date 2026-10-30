import { Link } from 'expo-router'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

const AlbumCard = ({ item }) => {
    return (
        <Link href={`../album/${item.id}`} asChild>
            <Pressable style={styles.card}>
                <Image style={styles.image} source={{ uri: item.cover }} />
                <Text style={styles.albumName} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                <Text style={styles.itemCount}>{item.assetCount}</Text>
            </Pressable>
        </Link>
    )
}

export default AlbumCard

const styles = StyleSheet.create({
    card: {
        borderRadius: 10,
        padding: 6,
        
    },
    albumName: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        width: 70
    },
    images: {
        width: 50,
        height: 50,
        marginBottom: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    itemCount: { 
        color: 'white',
        fontSize: 13,
        fontWeight: '100'
    }
})