import { useCallback } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssets } from '../../context/MediaContext';
import { usePinchColumns } from '../../hooks/usePinchColumns';
import MediaThumb from '../../components/MediaThumb';

const GAP = 3;
const keyExtractor = (item) => item.id;

const Pictures = () => {
    const { columns, gesture } = usePinchColumns('picturesColumns');
    const { assets, loadMore } = useAssets();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    // FlashList gives every cell width / columns; the gap lives inside each tile
    const size = width / columns - GAP;

    const renderItem = useCallback(
        ({ item }) => <MediaThumb item={item} size={size} gap={GAP} />,
        [size]
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={{ alignItems: 'center', paddingBottom: '3%' }}>
                <Text style={styles.header}>Photos</Text>
            </View>

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

export default Pictures;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        paddingBottom: 40,
    },
    header: {
        fontSize: 30,
        color: 'white',
    },
});
