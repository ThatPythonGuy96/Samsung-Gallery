import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, Platform, Pressable, StyleSheet, Text, ToastAndroid, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lucide } from '@react-native-vector-icons/lucide';
import { RETENTION_DAYS, deleteForever, emptyTrash, restoreMedia, useTrash } from '../utils/actions';
import { thumbUri } from '../utils/thumbnails';
import { formatDuration } from '../utils/format';

const COLUMNS = 3;
const GAP = 3;
const keyExtractor = (item) => item.id;

const notify = (message) =>
    Platform.OS === 'android' ? ToastAndroid.show(message, ToastAndroid.SHORT) : Alert.alert(message);

const BinTile = ({ item, size, selected, selecting, onToggle }) => {
    const uri = useMemo(() => thumbUri(item) ?? item.uri, [item]);
    const tileStyle = useMemo(() => ({ width: size, height: size, margin: GAP / 2 }), [size]);

    return (
        <Pressable
            style={tileStyle}
            onPress={() => onToggle(item.id)}
            onLongPress={() => onToggle(item.id)}
            accessibilityState={{ selected }}
        >
            <Image
                source={uri}
                style={[styles.image, selected && { opacity: 0.45 }]}
                contentFit="cover"
                decodeFormat="rgb"
                recyclingKey={item.id}
                transition={0}
                autoplay={false}
            />

            <View style={styles.days}>
                <Text style={styles.daysText}>{item.daysLeft}d</Text>
            </View>

            {item.mediaType === 'video' && (
                <View style={styles.video}>
                    <Lucide name="play" size={10} color="#fff" />
                    <Text style={styles.daysText}>{formatDuration(item.duration)}</Text>
                </View>
            )}

            {selecting && (
                <View style={[styles.check, selected && styles.checkOn]}>
                    {selected && <Lucide name="check" size={14} color="#fff" />}
                </View>
            )}
        </Pressable>
    );
};

export default function Recycle() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const list = useTrash();
    const [selected, setSelected] = useState(() => new Set());

    const selecting = selected.size > 0;
    const allSelected = list.length > 0 && selected.size === list.length;
    const size = width / COLUMNS - GAP;

    const toggle = useCallback((id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const clear = useCallback(() => setSelected(new Set()), []);
    const selectAll = () => setSelected(new Set(list.map((t) => t.id)));

    // drop selections for items that are gone (restored or deleted)
    useEffect(() => {
        setSelected((prev) => {
            if (prev.size === 0) return prev;
            const present = new Set(list.map((t) => t.id));
            const next = new Set([...prev].filter((id) => present.has(id)));
            return next.size === prev.size ? prev : next;
        });
    }, [list]);

    // the back button leaves selection mode first
    useEffect(() => {
        if (!selecting) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            clear();
            return true;
        });
        return () => sub.remove();
    }, [selecting, clear]);

    const ids = [...selected];

    const onRestore = () => {
        restoreMedia(ids);
        notify(ids.length === 1 ? 'Restored 1 item' : `Restored ${ids.length} items`);
        clear();
    };

    const onDeleteForever = () =>
        Alert.alert(
            `Delete ${ids.length === 1 ? '1 item' : `${ids.length} items`} permanently?`,
            'This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        // Android shows its own confirmation; if declined, nothing is deleted
                        if (await deleteForever(ids)) clear();
                    },
                },
            ]
        );

    const onEmpty = () =>
        Alert.alert('Empty the recycle bin?', 'Everything in it will be deleted permanently.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Empty', style: 'destructive', onPress: () => emptyTrash() },
        ]);

    const renderItem = useCallback(
        ({ item }) => (
            <BinTile
                item={item}
                size={size}
                selected={selected.has(item.id)}
                selecting={selecting}
                onToggle={toggle}
            />
        ),
        [size, selected, selecting, toggle]
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
            <View style={styles.header}>
                {selecting ? (
                    <>
                        <Pressable onPress={clear} hitSlop={10}>
                            <Lucide name="x" size={24} color="#fff" />
                        </Pressable>
                        <Text style={styles.title}>{selected.size} selected</Text>
                        <Pressable onPress={allSelected ? clear : selectAll} hitSlop={10}>
                            <Text style={styles.link}>{allSelected ? 'Deselect all' : 'Select all'}</Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <Pressable onPress={() => router.back()} hitSlop={10}>
                            <Lucide name="arrow-left" size={24} color="#fff" />
                        </Pressable>
                        <Text style={styles.title}>Recycle bin</Text>
                        {list.length > 0 ? (
                            <Pressable onPress={onEmpty} hitSlop={10}>
                                <Text style={styles.danger}>Empty</Text>
                            </Pressable>
                        ) : (
                            <View style={{ width: 40 }} />
                        )}
                    </>
                )}
            </View>

            <Text style={styles.note}>
                {selecting
                    ? 'Tap items to select or deselect them.'
                    : `Items are deleted permanently after ${RETENTION_DAYS} days. Tap an item to select it.`}
            </Text>

            <FlashList
                data={list}
                extraData={selected}
                numColumns={COLUMNS}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: selecting ? 120 : 24 }}
                ListEmptyComponent={<Text style={styles.empty}>The recycle bin is empty.</Text>}
            />

            {selecting && (
                <View style={[styles.actions, { paddingBottom: insets.bottom + 12 }]}>
                    <Pressable style={styles.button} onPress={onRestore}>
                        <Lucide name="undo-2" size={18} color="#fff" />
                        <Text style={styles.buttonText}>Restore</Text>
                    </Pressable>
                    <Pressable style={[styles.button, styles.buttonDanger]} onPress={onDeleteForever}>
                        <Lucide name="trash-2" size={18} color="#fff" />
                        <Text style={styles.buttonText}>Delete</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        minHeight: 40,
    },
    title: { color: 'white', fontSize: 20, fontWeight: '600' },
    link: { color: '#818cf8', fontSize: 16 },
    danger: { color: '#f87171', fontSize: 16 },
    note: { color: '#8e8e93', fontSize: 13, textAlign: 'center', marginVertical: 12, paddingHorizontal: 24 },
    empty: { color: '#8e8e93', textAlign: 'center', marginTop: 80 },
    image: { width: '100%', height: '100%', backgroundColor: '#1c1c1e' },
    days: {
        position: 'absolute',
        left: 4,
        bottom: 4,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    daysText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    video: {
        position: 'absolute',
        right: 4,
        bottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    check: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    checkOn: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    actions: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4f46e5',
    },
    buttonDanger: { backgroundColor: '#dc2626' },
    buttonText: { color: 'white', fontWeight: '600' },
});
