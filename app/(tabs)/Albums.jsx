import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { Lucide } from '@react-native-vector-icons/lucide';
import AlbumCard from '../../components/AlbumCard';
import { useMedia } from '../../context/MediaContext';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePinchColumns } from '../../hooks/usePinchColumns';
import { GestureDetector } from 'react-native-gesture-handler';

const GAP = 1;

const Albums = () => {
    const insets = useSafeAreaInsets();
    const { columns, gesture } = usePinchColumns('albumsColumns');

    const { albums } = useMedia();
    const { width } = useWindowDimensions();
    const size = (width - GAP * (columns - 1)) / columns;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.icons}>
                <Lucide name='search' size={27} color={'white'} />
                <Lucide name='ellipsis-vertical' size={27} color={'white'} />
            </View>

            <View style={styles.header}>
                <Text style={styles.albumHeader}>Albums</Text>
            </View>
            
            <GestureDetector gesture={gesture}>
                <FlatList
                    key={columns}
                    data={albums}
                    numColumns={columns}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: GAP, paddingBottom: 30 }}
                    columnWrapperStyle={{ gap: GAP }}
                    renderItem={({ item }) => (
                        <AlbumCard item={item} size={size} />
                    )}
                />
            </GestureDetector>
        </View>
    )
}

export default Albums

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        paddingBottom: 80,
        // height: '80%'
    },
    albumHeader: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        paddingLeft: '4%',
        paddingBottom: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: 30,
        gap: 10
    },
    icons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: 30,
        gap: 10
    }
})