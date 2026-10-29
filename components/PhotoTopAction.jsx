import { Pressable, StyleSheet, View } from 'react-native'
import { Lucide } from '@react-native-vector-icons/lucide';
import { useRouter } from 'expo-router';

const PhotoTopAction = () => {
    const router = useRouter();

    const goBack = () => {
        router.back();
    } 

    return (
        <View style={styles.actionContainer}>
            <Pressable onPress={goBack}>
                <Lucide name="arrow-left" size={27} color='#fff' style='styles.icon' />
            </Pressable>
        </View>
    )
}

export default PhotoTopAction

const styles = StyleSheet.create({
    actionContainer: {
        backgroundColor: 'red',
        alignContent: 'center',
        paddingTop: 60,
        paddingHorizontal: 25,
        position: 'absolute',
        width: '100%',
        marginHorizontal: 10,

    },
    icon: {
        padding: 10,
        borderRadius: 15
    }
})