import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { copyToAlbum, moveToAlbum, copyToClipboard, viewInfo } from '../utils/actions';

export default function MediaContextMenu({ visible, onClose, item }) {
    const actions = [
        { id: 'details', label: 'Details', onPress: viewInfo },
        { id: 'copy-clipboard', label: 'Copy to clipboard', onPress: () => copyToClipboard([item]) },
        { id: 'copy-album', label: 'Copy to album', onPress: copyToAlbum },
        { id: 'move-album', label: 'Move to album', onPress: moveToAlbum },
        { id: 'wallpaper', label: 'Set as wallpaper', onPress: null },
        { id: 'secure-folder', label: 'Move to Secure Folder', onPress: null },
        { id: 'print', label: 'Print', onPress: null },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                />

                <View style={styles.menu}>
                    {actions.map((action, index) => (
                        <React.Fragment key={action.id}>
                            {[1, 4].includes(index) && (
                                <View style={styles.divider} />
                            )}

                            <Pressable
                                style={styles.menuItem}
                                onPress={() => {
                                    onClose();
                                    action.onPress
                                }}
                            >
                                <Text style={styles.menuText}>
                                    {action.label}
                                </Text>
                            </Pressable>
                        </React.Fragment>
                    ))}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    menu: {
        width: 170,
        maxWidth: '90%',
        marginRight: 4,
        marginBottom: 79,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 27,
        backgroundColor: '#383838',
        elevation: 15,
    },
    menuItem: {
        minHeight: 30,
        justifyContent: 'center',
        paddingHorizontal: 11,
    },
    menuText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    divider: {
        height: .5,
        borderStyle: 'dotted',
        borderWidth: 1,
        borderColor: '#777',
        marginVertical: 12,
    },
});
