import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList, Pressable, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';
import PhotoActionBar from '../../components/PhotoActionBar';
import PhotoTopAction from '../../components/PhotoTopAction';
import { useAssets } from '../../context/MediaContext';

const THUMB = 60;
const GAP = 8;

const ImageScreen = () => {
    const { id, album } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { assets: photos, loadMore } = useAssets(album);
    const [favorites, setFavorites] = useState({});

    const pagerRef = useRef(null);
    const stripRef = useRef(null);
    const pagerIndex = useRef(-1);

    const index = photos.findIndex((p) => p.id === id);
    const photo = photos[index];

    // pinch in to close
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const goBack = () => router.back();

    const pinch = Gesture.Pinch()
        .onChange((e) => { scale.value = e.scale; })
        .onEnd((e) => {
            if (e.velocity < 0) {
                runOnJS(goBack)();
            } else {
                scale.value = withTiming(1);
            }
        });

    // keep pager and strip in step with the selected photo
    useEffect(() => {
        if (index < 0) return;
        if (pagerIndex.current !== index) {
            pagerIndex.current = index;
            pagerRef.current?.scrollToIndex({ index, animated: false }); // e.g. thumbnail tapped
        }
        stripRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
    }, [index]);

    // user finished swiping the pager
    const onPagerSettled = (e) => {
        const next = Math.round(e.nativeEvent.contentOffset.x / width);
        if (next !== pagerIndex.current && photos[next]) {
            pagerIndex.current = next;
            router.setParams({ id: photos[next].id });
        }
    };

    if (!photo) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white', margin: 20 }}>Loading...</Text>
            </View>
        );
    }

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
            <GestureDetector gesture={pinch}>
                <Animated.View style={[styles.pager, animatedStyle]}>
                    <FlatList
                        ref={pagerRef}
                        data={photos}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        initialScrollIndex={Math.max(index, 0)}
                        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
                        onMomentumScrollEnd={onPagerSettled}
                        onEndReached={loadMore}
                        onEndReachedThreshold={1}
                        initialNumToRender={1}
                        windowSize={3}
                        renderItem={({ item }) => (
                            <Image
                                source={{ uri: item.uri }}
                                style={{ width, height: '100%' }}
                                resizeMode="contain"
                            />
                        )}
                    />
                </Animated.View>
            </GestureDetector>

            <PhotoTopAction />

            <View style={styles.strip}>
                <FlatList
                    ref={stripRef}
                    data={photos}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    initialScrollIndex={Math.max(index, 0)}
                    getItemLayout={(_, i) => ({ length: THUMB + GAP, offset: (THUMB + GAP) * i, index: i })}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={{ paddingHorizontal: 12 }}
                    renderItem={({ item }) => {
                        const selected = item.id === photo.id;
                        return (
                            <Pressable
                                onPress={() => router.setParams({ id: item.id })}
                                style={[styles.thumbWrap, selected && styles.thumbSelected]}
                            >
                                <Image source={{ uri: item.uri }} style={styles.thumb} />
                            </Pressable>
                        );
                    }}
                />
            </View>

            <View style={{ paddingTop: 12, paddingBottom: insets.bottom + 12 }}>
                <PhotoActionBar
                    liked={!!favorites[photo.id]}
                    onLike={toggleLike}
                    onEdit={() => {}}
                    info={() => {Alert('Info')}}
                    onShare={() => {}}
                    onDelete={confirmDelete}
                />
            </View>
        </View>
    );
};

export default ImageScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    pager: { flex: 1 },
    strip: { paddingTop: 8 },
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
    thumbSelected: { opacity: 1, borderColor: '#fff' },
    thumb: { width: '100%', height: '100%' },
});