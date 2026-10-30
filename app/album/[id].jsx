import { FlatList, StyleSheet, Text, View, Pressable, Image, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { useAssets, useMedia } from '../../context/MediaContext';

const COLUMNS = 4;
const GAP = 2;

const Album = () => {
    const { id } = useLocalSearchParams();
    const { albums } = useMedia();
    const { assets, loadMore } = useAssets(id);
    const { width } = useWindowDimensions();

    const size = (width - GAP * (COLUMNS - 1)) / COLUMNS;
    const album = albums.find((a) => a.id === id);

    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 10 }}>
                <Text style={styles.header}>{album?.title}</Text>
            </View>

            <FlatList
                data={assets}
                numColumns={COLUMNS}
                keyExtractor={(item) => item.id}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{ gap: GAP }}
                columnWrapperStyle={{ gap: GAP }}
                renderItem={({ item }) => {
                    const route = item.mediaType === 'video' ? 'video' : 'photo';
                    return (
                        <Link href={`/${route}/${item.id}?album=${id}`} asChild>
                            <Pressable style={{ width: size, height: size }}>
                                <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} />
                            </Pressable>
                        </Link>
                    );
                }}
            />
        </View>
    );
};

export default Album;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black', paddingBottom: 100 },
    header: { fontSize: 30, color: 'white' },
});