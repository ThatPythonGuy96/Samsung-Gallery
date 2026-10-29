import { Link } from 'expo-router'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

const AlbumCard = ({ item }) => {
    return (
        <Link href={`../album/${item.name}`} asChild>
            <Pressable style={styles.card}>
                <Image style={styles.image} source={item.photos[0].image} />
                <Text style={styles.albumName}>{item.name}</Text>
                <Text style={styles.itemCount}>{item.photos.length}</Text>
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
        fontWeight: '600'
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