import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Lucide } from '@react-native-vector-icons/lucide';
import { thumbUri } from '../utils/thumbnails';

const H = 60;
const PHOTO_W = 40;
const VIDEO_W = 74;
const GAP = 8;
const PAD = 12;

const StripItem = memo(function StripItem({ asset, index, selected, onSelect }) {
    const isVideo = asset.mediaType === 'video';
    const uri = useMemo(() => thumbUri(asset) ?? asset.uri, [asset]);

    return (
        <Pressable
            onPress={() => onSelect(index, asset.id)}
            style={[styles.wrap, { width: isVideo ? VIDEO_W : PHOTO_W }, selected && styles.selected]}
        >
            <Image
                source={uri}
                style={styles.fill}
                contentFit="cover"
                decodeFormat="rgb"
                recyclingKey={asset.id}
                cachePolicy="memory-disk"
                transition={0}
                autoplay={false}
            />
            {isVideo && (
                <View style={styles.playBadge}>
                    <Lucide name="play" size={10} color="#fff" />
                </View>
            )}
        </Pressable>
    );
});

const keyExtractor = (a) => a.id;

const MediaStrip = ({ assets, activeIndex, loadMore, onSelect }) => {
    const listRef = useRef(null);
    const lastIndex = useRef(-1);

    // exact position of every item, since photos and videos have different widths
    const layout = useMemo(() => {
        const out = [];
        let offset = PAD;
        assets.forEach((a, index) => {
            const length = (a.mediaType === 'video' ? VIDEO_W : PHOTO_W) + GAP;
            out.push({ length, offset, index });
            offset += length;
        });
        return out;
    }, [assets]);

    const layoutRef = useRef(layout);
    layoutRef.current = layout;

    const getItemLayout = useCallback(
        (_, i) => layoutRef.current[i] ?? { length: 0, offset: 0, index: i },
        []
    );

    // keep the active thumbnail centered; jump (don't animate) across long distances
    useEffect(() => {
        if (activeIndex < 0 || !layoutRef.current[activeIndex]) return;
        const far = Math.abs(activeIndex - lastIndex.current) > 6;
        lastIndex.current = activeIndex;
        listRef.current?.scrollToIndex({ index: activeIndex, viewPosition: 0.5, animated: !far });
    }, [activeIndex]);

    const renderItem = useCallback(
        ({ item, index }) => (
            <StripItem asset={item} index={index} selected={index === activeIndex} onSelect={onSelect} />
        ),
        [activeIndex, onSelect]
    );

    return (
        <View style={styles.strip}>
            <FlatList
                ref={listRef}
                data={assets}
                extraData={activeIndex}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                initialScrollIndex={Math.max(activeIndex, 0)}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={11}
                onEndReached={loadMore}
                onEndReachedThreshold={1}
                contentContainerStyle={{ paddingHorizontal: PAD }}
                renderItem={renderItem}
            />
        </View>
    );
};

export default memo(MediaStrip);

const styles = StyleSheet.create({
    strip: { paddingTop: 8 },
    wrap: {
        height: H,
        marginRight: GAP,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: .9,
        borderColor: 'transparent',
        backgroundColor: '#1c1c1e',
    },
    selected: { borderColor: '#fff', borderWidth: .5 },
    fill: { width: '100%', height: '100%' },
    playBadge: {
        position: 'absolute',
        right: 3,
        bottom: 3,
        padding: 3,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
});
