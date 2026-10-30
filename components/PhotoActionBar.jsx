import { View, Pressable, StyleSheet } from 'react-native';
import { Lucide } from '@react-native-vector-icons/lucide';

export default function PhotoActionBar({ liked, onLike, onEdit, info, onShare, onDelete }) {
    const actions = [
        {
            key: 'like',
            label: liked ? 'Remove from favorites' : 'Add to favorites',
            onPress: onLike,
            icon: (
                <Lucide
                    name='heart'
                    size={24}
                    color={liked ? '#ef4444' : '#fff'}
                    fill={liked ? '#ef4444' : 'none'}
                />
            ),
        },
        { key: 'edit', label: 'Edit', onPress: onEdit, icon: <Lucide name='pencil' size={24} color="#fff" /> },
        { key: 'info', label: 'Info', onpress: null, icon: <Lucide name='info' size={26} color="#fff" />},
        { key: 'share', label: 'Share', onPress: onShare, icon: <Lucide name='share-2' size={24} color="#fff" /> },
        { key: 'delete', label: 'Delete', onPress: onDelete, icon: <Lucide name='trash-2' size={24} color="#fff" /> },
    ];

    return (
        <View style={styles.bar}>
            {actions.map(({ key, label, onPress, icon }) => (
                <Pressable
                    key={key}
                    onPress={onPress}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    hitSlop={8}
                    style={({ pressed }) => [styles.button, pressed && { opacity: 0.5 }]}
                >
                    {icon}
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginHorizontal: 32,
        paddingVertical: 8,
        borderRadius: 32,
        backgroundColor: '#1c1c1e',
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        // Android shadow
        elevation: 10,
    },
    button: {
        padding: 12,
    },
});