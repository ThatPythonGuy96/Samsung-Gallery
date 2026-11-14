import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { GestureDetector } from 'react-native-gesture-handler';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useAssets, useMedia } from '../../context/MediaContext';
import MediaThumb from '../../components/MediaThumb';
import { usePinchColumns } from '../../hooks/usePinchColumns';

const GAP = 2;
const keyExtractor = (item) => item.id;

const Album = () => {
    const { id } = useLocalSearchParams();
    const { albums } = useMedia();
    const { assets, loadMore } = useAssets(id);
    const { width } = useWindowDimensions();
    const { columns, gesture } = usePinchColumns('albumColumns', { min: 3, max: 6 });
    const router = useRouter();

    const size = width / columns - GAP;
    const album = albums.find((a) => a.id === id);

    const renderItem = useCallback(
        ({ item }) => <MediaThumb item={item} size={size} gap={GAP} albumId={id} />,
        [size, id]
    );

    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 10 }}>
                <Text style={styles.header}>{album?.title}</Text>
            </View>

            <Pressable onPress={() => router.back()} hitSlop={10}>
                <Lucide name="chevron-left" size={27} color="#fff" />
            </Pressable>

            <GestureDetector gesture={gesture}>
                <View style={{ flex: 1 }}>
                    <FlashList
                        key={columns}
                        data={assets}
                        numColumns={columns}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        onEndReached={loadMore}
                        onEndReachedThreshold={1.5}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </GestureDetector>
        </View>
    );
};

export default Album;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    header: { fontSize: 30, color: 'white' },
});
