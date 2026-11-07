import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAssets, useMedia } from '../../context/MediaContext';
import MediaThumb from '../../components/MediaThumb';
import { usePinchColumns } from '../../hooks/usePinchColumns';
import { GestureDetector } from 'react-native-gesture-handler';
import PhotoTopAction from '../../components/PhotoTopAction';
import Lucide from '@react-native-vector-icons/lucide';

const GAP = 2;

const Album = () => {
    const { id } = useLocalSearchParams();
    const { albums } = useMedia();
    const { assets, loadMore } = useAssets(id);
    const { width } = useWindowDimensions();
    const { columns, gesture } = usePinchColumns('albumColumns', 3, 6);
    const router = useRouter();

    const goBack = () => {
        router.back();
    }

    const size = (width - GAP * (columns - 1)) / columns;
    const album = albums.find((a) => a.id === id);

    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 10 }}>
                <Text style={styles.header}>{album?.title}</Text>
            </View>

            <Pressable onPress={goBack}>
                <Lucide name="chevron-left" size={27} color='#fff' style={styles.icon} />
            </Pressable>

            <GestureDetector gesture={gesture}>
                <FlatList
                    key={columns}
                    data={assets}
                    numColumns={columns}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={{ gap: GAP }}
                    columnWrapperStyle={{ gap: GAP }}
                    renderItem={({ item }) => <MediaThumb item={item} size={size} albumId={id} />}
                />
            </GestureDetector>
        </View>
    );
};

export default Album;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    header: { fontSize: 30, color: 'white' },
});