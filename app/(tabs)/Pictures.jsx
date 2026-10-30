import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router';
import { useAssets } from '../../context/MediaContext';

const Pictures = () => {
    const { assets, loadMore } = useAssets();

    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', paddingBottom: 10}}>
                <Text style={styles.header}>Photos</Text>
            </View>

            <FlatList
                data={assets}
                numColumns={4}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{ gap: 2 }}
                columnWrapperStyle={{ gap: 2 }}
                renderItem={({ item }) => {
                    const route = item.mediaType === 'video' ? 'video' : 'photo';
                    return (
                        <Link href={`/${route}/${item.id}`} asChild>
                            <Pressable style={styles.image}>
                                <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%'}}/>
                            </Pressable>
                        </Link>
                    );
                }}
            />
        </View>
    )
}

export default Pictures

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        paddingBottom: 40,
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