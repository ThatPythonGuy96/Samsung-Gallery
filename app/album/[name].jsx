import { FlatList, StyleSheet, Text, View, Pressable, Image } from 'react-native'
import { useLocalSearchParams, Link } from 'expo-router'
import { albums } from '../../data';

const Album = () => {
    const { name } = useLocalSearchParams();
    const album = albums.find((a) => a.name == name);

    if (!album) {
        return <Text>Album not found.</Text>
    }

    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', paddingBottom: 10 }}>
                <Text style={styles.header}>{album.name}</Text>
            </View>

            <FlatList
                data={album.photos}
                numColumns={4}
                contentContainerStyle={{ gap: 2 }}
                columnWrapperStyle={{ gap: 2 }}
                renderItem={({ item }) => (
                    <Link href={`../photo/${item.id}?album=${encodeURIComponent(album.name)}`} asChild>
                        <Pressable style={styles.image}>
                            <Image source={item.image} style={{ width: '100%', height: '100%' }} />
                        </Pressable>
                    </Link>
                )}
            />
        </View>
    )
}

export default Album

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        paddingBottom: 100,
    },
    image: {
        flexBasis: '25%',
        aspectRatio: 1,
    },
    textLight: {
        color: 'white',
    },
    header: {
        fontSize: 30,
        color: 'white'
    }
})