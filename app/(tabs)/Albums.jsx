import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import { Lucide } from '@react-native-vector-icons/lucide';
import AlbumCard from '../../components/AlbumCard';
import { albums } from '../../data';

const Albums = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.textLight}>Albums</Text>
                <Lucide name='plus' size={27} color={'white'}/>
            </View>

            <FlatList
                data={albums}
                numColumns={3}
                contentContainerStyle={{ gap: 9 }}
                columnWrapperStyle={{ gap: 9 }}
                renderItem={({ item }) => (
                    <AlbumCard item={item} />
                )}
            />
            
        </View>
    )
}

export default Albums

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        paddingBottom: 80,
    },
    textLight: {
        color: 'white',
        fontSize: 23
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 40,
        marginBottom: 30
    }
})