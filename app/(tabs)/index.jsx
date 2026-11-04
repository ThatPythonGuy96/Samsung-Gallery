import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { useAssets } from '../../context/MediaContext';
import MediaThumb from '../../components/MediaThumb';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePinchColumns } from '../../hooks/usePinchColumns';
import { GestureDetector } from 'react-native-gesture-handler';
import { groupByDate } from '../../utils/groupByDate';
import { useMemo } from 'react';

const GAP = 3;

const Pictures = () => {
    const { columns, gesture } = usePinchColumns('picturesColumns');
    const { assets, loadMore } = useAssets();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const size = (width - GAP * (columns - 1)) / columns;
    // const rows = useMemo(() => groupByDate(assets, columns), [assets, columns]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={{ alignItems: 'center', paddingBottom: '3%' }}>
                <Text style={styles.header}>Photos</Text>
            </View>

            <GestureDetector gesture={gesture}>
                <FlatList
                    key={columns}
                    data={assets}
                    keyExtractor={(item) => item.id}
                    numColumns={columns}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={{ gap: GAP }}
                    columnWrapperStyle={{ gap: GAP }}
                    renderItem={({ item }) => <MediaThumb item={item} size={size} />}
                />
            </GestureDetector>
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
    },
    button: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, backgroundColor: '#4f46e5' },

})