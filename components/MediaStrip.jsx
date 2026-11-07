import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native'
import Lucide from '@react-native-vector-icons/lucide';
import { useRouter } from 'expo-router';

const THUMB = 60;
const GAP = 8;

const MediaStrip = ({ stripRef, assets, id, index, loadMore, item }) => {
    const router = useRouter();

    return (
        <View style={styles.strip}>
            <FlatList
                ref={stripRef}
                data={assets}
                extraData={id}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(a) => a.id}
                initialScrollIndex={Math.max(index, 0)}
                getItemLayout={(_, i) => ({ length: THUMB + GAP, offset: (THUMB + GAP) * i, index: i })}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{ paddingHorizontal: 12 }}
                renderItem={({ item: a }) => {
                    const selected = a.id === item.id;
                    return (
                        <Pressable
                            onPress={() => router.setParams({ id: a.id })}
                            style={[a.mediaType === 'video' ? styles.videoThumbWrap : styles.thumbWrap, selected && styles.thumbSelected]}
                        >
                            <Image source={{ uri: a.uri }} style={[a.mediaType === 'video' ? styles.videoThumb : styles.imageThumb]} />
                            {a.mediaType === 'video' && (
                                <View style={styles.playBadge}>
                                    <Lucide name="play" size={10} color="#fff" />
                                </View>
                            )}
                        </Pressable>
                    );
                }}
            />
        </View>
    )
}

export default MediaStrip

const styles = StyleSheet.create({
    strip: {
        paddingTop: 8
    },
    playBadge: {
        position: 'absolute',
        right: 3,
        bottom: 3,
        padding: 3,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    imageThumb: {
        width: 40,
        height: THUMB
    },
    thumbWrap: {
        width: 40,
        height: THUMB,
        marginRight: GAP,
        borderRadius: 8,
        overflow: 'hidden',
        opacity: 1,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    videoThumb: {
        width: 74,
        height: 58,
    },
    videoThumbWrap: {
        width: 74,
        height: 58,
        marginRight: GAP,
        borderRadius: 8,
        overflow: 'hidden',
        opacity: 1,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbSelected: {
        opacity: 1,
        borderColor: '#fff',
        borderWidth: .6,
    },
})