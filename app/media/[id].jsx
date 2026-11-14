import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert, FlatList, Platform, StyleSheet, Text, ToastAndroid, View, useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useVideoPlayer } from 'expo-video';
import PhotoActionBar from '../../components/PhotoActionBar';
import PhotoTopAction from '../../components/PhotoTopAction';
import MediaStrip from '../../components/MediaStrip';
import VideoControls from '../../components/VideoControls';
import ZoomableImage from '../../components/ZoomableImage';
import AlbumPicker from '../../components/AlbumPicker';
import { useAssets, useMedia } from '../../context/MediaContext';
import { VideoPlayer } from '../../utils/VideoPlayer';
import { formatDuration } from '../../utils/format';
import {
    RETENTION_DAYS, copyToAlbum, deleteMedia, moveToAlbum, toggleFavorite, useIsFavorite, copyToClipboard, viewInfo
} from '../../utils/actions';
import MediaContextMenu from '../../components/MediaContextMenu';

const keyExtractor = (a) => a.id;

const notify = (message) =>
    Platform.OS === 'android' ? ToastAndroid.show(message, ToastAndroid.SHORT) : Alert.alert(message);

const MediaScreen = () => {
    const { id, album } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width, height: windowHeight } = useWindowDimensions();
    const { assets, loadMore } = useAssets(album);
    const { albums, reload } = useMedia();
    const [uiVisible, setUiVisible] = useState(true);
    const [zoomed, setZoomed] = useState(false); // true while a photo is zoomed in: locks the pager
    const [pickerMode, setPickerMode] = useState(null); // null | 'copy' | 'move'
    const [pageHeight, setPageHeight] = useState(windowHeight);
    const toggleUi = useCallback(() => setUiVisible((v) => !v), []);
    const [modalVisible, setModalVisible] = useState(false);

    const pagerRef = useRef(null);
    const pagerIndex = useRef(-1);

    const index = assets.findIndex((a) => a.id === id);
    const item = assets[index];
    const liked = useIsFavorite(item?.id);

    // while a swipe is in progress the strip follows it live; the route param
    // catches up when the swipe settles
    const [live, setLive] = useState(null); // { from, to }
    const onPagerScroll = (e) => {
        const to = Math.round(e.nativeEvent.contentOffset.x / width);
        if (to < 0 || to >= assets.length) return;
        setLive((prev) => (prev && prev.from === index && prev.to === to ? prev : { from: index, to }));
    };
    const activeIndex = live && live.from === index ? live.to : index;

    const uiOpacity = useSharedValue(1);
    const uiStyle = useAnimatedStyle(() => ({ opacity: uiOpacity.value }));

    useEffect(() => {
        uiOpacity.value = withTiming(uiVisible ? 1 : 0, { duration: 180 });
    }, [uiVisible]);

    // a new photo always starts un-zoomed
    useEffect(() => {
        setZoomed(false);
    }, [id]);

    // keep the pager on the selected item (the strip scrolls itself)
    useEffect(() => {
        if (index < 0) return;
        if (pagerIndex.current !== index) {
            pagerIndex.current = index;
            pagerRef.current?.scrollToIndex({ index, animated: false });
        }
    }, [index]);

    const onPagerSettled = (e) => {
        const next = Math.round(e.nativeEvent.contentOffset.x / width);
        if (next !== pagerIndex.current && assets[next]) {
            pagerIndex.current = next;
            router.setParams({ id: assets[next].id });
        }
    };

    // tapping a thumbnail: jump the pager now, then update the route
    const onSelect = useCallback((i, assetId) => {
        pagerIndex.current = i;
        pagerRef.current?.scrollToIndex({ index: i, animated: false });
        router.setParams({ id: assetId });
    }, [router]);

    const player = useVideoPlayer(null, (p) => {
        p.timeUpdateEventInterval = 0.5; // seconds between time updates
    });

    useEffect(() => {
        player.pause();
        player.loop = true;
    }, [id, player]);

    // stable page renderer, so scrolling doesn't re-render every page
    const renderPage = useCallback(({ item: a }) =>
        a.mediaType === 'video' ? (
            <VideoPlayer item={a} active={a.id === id} width={width} player={player} onTap={toggleUi} />
        ) : (
            <ZoomableImage
                item={a}
                width={width}
                height={pageHeight}
                active={a.id === id}
                zoomed={zoomed}
                onTap={toggleUi}
                onZoomChange={setZoomed}
            />
        ), [id, width, pageHeight, zoomed, player, toggleUi]);

    if (!item) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white', margin: 20 }}>Loading...</Text>
            </View>
        );
    }

    // after this item is gone from the list (deleted or moved), show its neighbour
    const leaveItem = () => {
        const neighbour = assets[index + 1] ?? assets[index - 1];
        if (neighbour) router.setParams({ id: neighbour.id });
        else router.back();
    };

    const confirmDelete = () => {
        Alert.alert(
            `Move ${item.mediaType} to the recycle bin?`,
            `You can restore it for ${RETENTION_DAYS} days.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Move to bin',
                    style: 'destructive',
                    onPress: () => {
                        leaveItem(); // first, so the pager never points at a hidden item
                        deleteMedia([item]);
                        notify('Moved to the recycle bin');
                    },
                },
            ]
        );
    };

    const onMore = () => setModalVisible(!modalVisible)

    const onPickAlbum = async (destination) => {
        const mode = pickerMode;
        setPickerMode(null);

        const ok = mode === 'move'
            ? await moveToAlbum([item], destination.id, album)
            : await copyToAlbum([item], destination.id);

        if (!ok) {
            notify(`Couldn't ${mode} this ${item.mediaType}`);
            return;
        }
        if (mode === 'move') leaveItem();
        notify(`${mode === 'move' ? 'Moved' : 'Copied'} to ${destination.title}`);
        reload(); // the library changed
    };

    return (
        <View style={styles.container}>
            <View style={styles.pager} onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}>
                <FlatList
                    ref={pagerRef}
                    data={assets}
                    extraData={`${id}-${zoomed}-${pageHeight}`} // re-render pages when these change
                    horizontal
                    pagingEnabled
                    scrollEnabled={!zoomed}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    initialScrollIndex={Math.max(index, 0)}
                    getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
                    onScroll={onPagerScroll}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={onPagerSettled}
                    onEndReached={loadMore}
                    onEndReachedThreshold={1}
                    initialNumToRender={1}
                    windowSize={3}
                    renderItem={renderPage}
                />
            </View>

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
                {item.mediaType === 'video' && <VideoControls player={player} duration={item.duration} />}

                <MediaStrip assets={assets} activeIndex={activeIndex} loadMore={loadMore} onSelect={onSelect} />

                <View style={{ paddingTop: 12 }}>
                    <PhotoActionBar
                        liked={liked}
                        onLike={() => toggleFavorite(item.id)}
                        onEdit={() => { }}
                        onShare={() => { }}
                        onMore={onMore}
                        onDelete={confirmDelete}
                    />
                </View>

                <MediaContextMenu visible={modalVisible} onClose={onMore} item={item} />

            </Animated.View>

            <AlbumPicker
                visible={pickerMode !== null}
                title={pickerMode === 'move' ? 'Move to album' : 'Copy to album'}
                albums={albums.filter((a) => a.id !== album)}
                onPick={onPickAlbum}
                onClose={() => setPickerMode(null)}
            />
        </View>
    );
};

export default MediaScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    pager: { ...StyleSheet.absoluteFillObject },
    bottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 8,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#fff',
        width: '40px'
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});
