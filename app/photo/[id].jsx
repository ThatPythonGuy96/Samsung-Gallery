import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { photos as allPhotos, albums } from '../../data';
import PhotoActionBar from '../../components/PhotoActionBar';
import PhotoTopAction from '../../components/PhotoTopAction';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Gesture, GestureDetector, useTapGesture, } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-worklets';

const THUMB = 64;
const GAP = 8;

const ImageScreen = () => {
    const { id, album: albumName } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const listRef = useRef(null);
    const [favorites, setFavorites] = useState({});

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const gesture = Gesture.Pinch()
        .onChange((e) => { scale.value = e.scale; console.log(scale.value)})
        .onEnd((e) => {
            if (e.velocity < 0) {
                runOnJS(router.back)();
            } else {
                scale.value = withTiming(1)
            }
        });

    const photos = useMemo(() => {
        const album = albums.find((a) => a.name === albumName);
        return album ? album.photos : allPhotos;
    }, [albumName]);

    const index = photos.findIndex((p) => p.id === Number.parseInt(id, 10));
    const photo = photos[index];

    useEffect(() => {
        if (index >= 0) {
            listRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
        }
    }, [index]);

    if (!photo) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white', margin: 20 }}>Missing Image.</Text>
            </View>
        );
    };

    const toggleLike = () => setFavorites((prev) => ({ ...prev, [photo.id]: !prev[photo.id] }));

    const confirmDelete = () => {
        Alert.alert('Delete photo?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    // TODO: delete the asset, then leave the screen
                    router.back();
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <PhotoTopAction />

            <GestureDetector gesture={gesture}>
                <Animated.Image source={photo.image} style={[styles.image, animatedStyle]} resizeMode="contain" />
            </GestureDetector>

            <View style={styles.strip}>
                <FlatList
                    ref={listRef}
                    data={photos}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => String(item.id)}
                    initialScrollIndex={Math.max(index, 0)}
                    getItemLayout={(_, i) => ({
                        length: THUMB + GAP,
                        offset: (THUMB + GAP) * i,
                        index: i,
                    })}
                    contentContainerStyle={{ paddingHorizontal: 12 }}
                    renderItem={({ item }) => {
                        const selected = item.id === photo.id;
                        return (
                            <Pressable
                                onPress={() => router.setParams({ id: String(item.id) })}
                                style={[styles.thumbWrap, selected && styles.thumbSelected]}
                            >
                                <Image source={item.image} style={styles.thumb} />
                            </Pressable>
                        );
                    }}
                />
            </View>

            <View style={{ paddingTop: 12, paddingBottom: insets.bottom + 12 }}>
                <PhotoActionBar
                    liked={!!favorites[photo.id]}
                    onLike={toggleLike}
                    onEdit={() => {/* open your editor screen */ }}
                    onShare={() => {/* see note below */ }}
                    onDelete={confirmDelete}
                />
            </View>
        </View>
    );
};

export default ImageScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    image: {
        flex: 1,
        width: '100%'
    },
    strip: {
        paddingTop: 8
    },
    thumbWrap: {
        width: THUMB,
        height: THUMB,
        marginRight: GAP,
        borderRadius: 8,
        overflow: 'hidden',
        opacity: 0.6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbSelected: {
        opacity: 1,
        borderColor: '#fff'
    },
    thumb: {
        width: '100%',
        height: '100%'
    },
});