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
                <Lucide name="chevron-left" size={27} color='#fff' style={styles.icon} />
            </Pressable>
        </View>
    )
}

export default PhotoTopAction

const styles = StyleSheet.create({
    actionContainer: {
        backgroundColor: 'transparent',
        paddingTop: 60,
        position: 'absolute',
        marginHorizontal: 10,
    },
    icon: {
        padding: 10,
        borderRadius: 30,
        backgroundColor: '#bfbcbc',
        width: 45,
        alignItems: 'center'
    }
})