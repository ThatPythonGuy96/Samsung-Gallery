import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { photos } from '../../data'
import { Link } from 'expo-router';

const Pictures = () => {
    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center', paddingBottom: 10}}>
                <Text style={styles.header}>Photos</Text>
            </View>

            <FlatList
                data={photos}
                numColumns={4}
                contentContainerStyle={{ gap: 2 }}
                columnWrapperStyle={{ gap: 2 }}
                renderItem={({ item }) => (
                    <Link href={`../photo/${item.id}`} asChild>
                        <Pressable style={styles.image}>
                            <Image source={item.image} style={{ width: '100%', height: '100%'}}/>
                        </Pressable>
                    </Link>
                )}
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