import { FlatList, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { Link } from 'expo-router';
import { useAssets } from '../../context/MediaContext';
import MediaThumb from '../../components/MediaThumb';

const COLUMNS = 4;
const GAP = 2;

const Pictures = () => {
    const { assets, loadMore } = useAssets();
    const { width } = useWindowDimensions();
    const size = (width - GAP * (COLUMNS - 1)) / COLUMNS;
    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', paddingBottom: 10}}>
                <Text style={styles.header}>Photos</Text>
            </View>

            <FlatList
                data={assets}
                numColumns={COLUMNS}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{ gap: 2 }}
                columnWrapperStyle={{ gap: 2 }}
                renderItem={({ item }) => <MediaThumb item={item} size={size} />}
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