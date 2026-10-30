import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList, Pressable, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { photos as allPhotos, albums } from '../../data';
import PhotoActionBar from '../../components/PhotoActionBar';
import PhotoTopAction from '../../components/PhotoTopAction';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated'
import { Gesture, GestureDetector, } from 'react-native-gesture-handler'
import { runOnJS } from 'react-native-worklets';

const THUMB = 64;
const GAP = 8;
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 800;

const ImageScreen = () => {
    const { id, album: albumName } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const listRef = useRef(null);
    const [favorites, setFavorites] = useState({});

    const photos = useMemo(() => {
        const album = albums.find((a) => a.name === albumName);
        return album ? album.photos : allPhotos;
    }, [albumName]);

    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { scale: scale.value }],
    }));

    const goTo = (nextIndex) => {
        router.setParams({ id: String(photos[nextIndex].id) });
    };

    const pinch = Gesture.Pinch()
        .onChange((e) => { scale.value = e.scale;})
        .onEnd((e) => {
            if (e.velocity < 0) {
                runOnJS(router.back)();
            } else {
                scale.value = withTiming(1)
            }
        });

    const pan = Gesture.Pan()
        .maxPointers(1)               // two fingers = pinch, not swipe
        .activeOffsetX([-15, 15])     // only activate on horizontal movement
        .failOffsetY([-20, 20])
        .onUpdate((e) => {
            const atEdge = (e.translationX > 0 && !hasPrev) || (e.translationX < 0 && !hasNext);
            translateX.value = atEdge ? e.translationX / 4 : e.translationX; // resistance at the ends
        })
        .onEnd((e) => {
            const swipedLeft =
                hasNext && (e.translationX < -SWIPE_DISTANCE || e.velocityX < -SWIPE_VELOCITY);
            const swipedRight =
                hasPrev && (e.translationX > SWIPE_DISTANCE || e.velocityX > SWIPE_VELOCITY);

            if (swipedLeft || swipedRight) {
                const dir = swipedLeft ? 1 : -1; // swipe left = next photo
                translateX.value = withTiming(-dir * width, { duration: 150 }, (finished) => {
                    if (finished) runOnJS(goTo)(index + dir);
                });
            } else {
                translateX.value = withSpring(0);
            }
        });

    const gesture = Gesture.Simultaneous(pinch, pan);

    

    const index = photos.findIndex((p) => p.id === Number.parseInt(id, 10));
    const photo = photos[index];
    const hasPrev = index > 0;
    const hasNext = index >= 0 && index < photos.length - 1;

    useEffect(() => {
        if (index >= 0) {
            listRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
        }
        translateX.value = 0;
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