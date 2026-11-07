import { useEffect, useRef, useState } from 'react';
import {
    Alert, FlatList, Pressable,
    StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Lucide } from '@react-native-vector-icons/lucide';
import PhotoActionBar from '../../components/PhotoActionBar';
import PhotoTopAction from '../../components/PhotoTopAction';
import { useAssets } from '../../context/MediaContext';
import { useEvent } from 'expo';
import { VideoPlayer } from '../../utils/VideoPlayer';
import MediaStrip from '../../components/MediaStrip';
import ImageView from '../../utils/ImageView';

const MediaScreen = () => {
    const { id, album } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { assets, loadMore } = useAssets(album);
    const [favorites, setFavorites] = useState({});
    const [uiVisible, setUiVisible] = useState(true);
    const toggleUi = () => setUiVisible((v) => !v);

    const pagerRef = useRef(null);
    const stripRef = useRef(null);
    const pagerIndex = useRef(-1);

    const index = assets.findIndex((a) => a.id === id);
    const item = assets[index];

    const pad = (n) => String(n).padStart(2, '0');

    const formatDuration = (seconds = 0) => {
        const total = Math.round(seconds);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
    };

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

    const tap = Gesture.Tap()
        .maxDuration(250)
        .onEnd((_e, success) => {
            if (success) runOnJS(toggleUi)();
        });

    const gesture = Gesture.Simultaneous(pinch, tap);

    const uiOpacity = useSharedValue(1);
    const uiStyle = useAnimatedStyle(() => ({ opacity: uiOpacity.value }));

    useEffect(() => {
        uiOpacity.value = withTiming(uiVisible ? 1 : 0, { duration: 180 });
    }, [uiVisible]);

    useEffect(() => {
        if (index < 0) return;
        if (pagerIndex.current !== index) {
            pagerIndex.current = index;
            pagerRef.current?.scrollToIndex({ index, animated: false });
        }
        stripRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
    }, [index]);

    const onPagerSettled = (e) => {
        const next = Math.round(e.nativeEvent.contentOffset.x / width);
        if (next !== pagerIndex.current && assets[next]) {
            pagerIndex.current = next;
            router.setParams({ id: assets[next].id });
        }
    };

    const player = useVideoPlayer(null, (p) => {
        p.timeUpdateEventInterval = 0.5; // seconds between time updates
    });

    useEffect(() => {
        player.pause();
        player.loop = true;
    }, [id, player]);

    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
    const { currentTime } = useEvent(player, 'timeUpdate', { currentTime: player.currentTime });

    const togglePlay = () => {
        if (isPlaying) player.pause();
        else if (item.duration && currentTime >= item.duration - 0.3) player.replay(); // finished: start over
        else player.play();
    };

    const toggleLike = () => setFavorites((prev) => ({ ...prev, [item.id]: !prev[item.id] }));

    const confirmDelete = () => {
        Alert.alert(`Delete ${item.mediaType}?`, 'This cannot be undone.', [
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
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.pager, animatedStyle]}>
                    <FlatList
                        ref={pagerRef}
                        data={assets}
                        extraData={id} // re-render pages when the active item changes
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(a) => a.id}
                        initialScrollIndex={Math.max(index, 0)}
                        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
                        onMomentumScrollEnd={onPagerSettled}
                        onEndReached={loadMore}
                        onEndReachedThreshold={1}
                        initialNumToRender={1}
                        windowSize={3}
                        renderItem={({ item: a }) =>
                            a.mediaType === 'video' ? (
                                <VideoPlayer item={a} active={a.id === id} width={width} player={player} />
                            ) : (
                                <ImageView uri={a.uri} width={width} />
                            )
                        }
                    />
                </Animated.View>
            </GestureDetector>

            <Animated.View
                style={[StyleSheet.absoluteFill, uiStyle]}
                pointerEvents={uiVisible ? 'box-none' : 'none'}
            >
                <PhotoTopAction />
            </Animated.View>

            <Animated.View
                style={[styles.bottom, { paddingBottom: insets.bottom + 12 }, uiStyle]}
                pointerEvents={uiVisible ? 'box-none' : 'none'}
            >
                {item.mediaType === 'video' && (
                    <Pressable style={styles.time} onPress={togglePlay} hitSlop={10}>
                        <Lucide name={isPlaying ? 'pause' : 'play'} size={12} color="#fff" />
                        <Text style={styles.duration}>{formatDuration(currentTime)}</Text>
                        <Text style={styles.duration}> / </Text>
                        <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
                    </Pressable>
                )}

                <MediaStrip assets={assets} id={id} index={index} loadMore={loadMore} item={item} />

                <View style={{ paddingTop: 12 }}>
                    <PhotoActionBar
                        liked={!!favorites[item.id]}
                        onLike={toggleLike}
                        onEdit={() => { }}
                        info={() => Alert.alert('Info')}
                        onShare={() => { }}
                        onDelete={confirmDelete}
                    />
                </View>
            </Animated.View>

        </View>
    );
};

export default MediaScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    pager: { flex: 1, height: '100%' },
    bottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 8,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    time: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 10,
    },
    duration: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'light'
    },
});