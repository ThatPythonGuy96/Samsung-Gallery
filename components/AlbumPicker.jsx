import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AlbumPicker({ visible, title, albums, onPick, onClose }) {
    const insets = useSafeAreaInsets();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                {/* the empty onPress stops taps on the sheet from closing it */}
                <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]} onPress={() => {}}>
                    <Text style={styles.title}>{title}</Text>
                    <FlatList
                        data={albums}
                        keyExtractor={(a) => a.id}
                        ListEmptyComponent={<Text style={styles.empty}>No other albums.</Text>}
                        renderItem={({ item }) => (
                            <Pressable style={styles.row} onPress={() => onPick(item)}>
                                <Image source={item.cover} style={styles.cover} contentFit="cover" recyclingKey={item.id} />
                                <View>
                                    <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.count}>{item.assetCount}</Text>
                                </View>
                            </Pressable>
                        )}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
        maxHeight: '65%',
        backgroundColor: '#1c1c1e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    title: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    cover: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#2c2c2e' },
    name: { color: 'white', fontSize: 16 },
    count: { color: '#8e8e93', fontSize: 13 },
    empty: { color: '#8e8e93', textAlign: 'center', paddingVertical: 24 },
});
