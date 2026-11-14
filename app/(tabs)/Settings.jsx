import { StyleSheet, Text, View, Pressable, Linking } from 'react-native'
import React from 'react';
import { Link } from 'expo-router';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useTrash } from '../../utils/actions';

const Settings = () => {
	const [permission, requestPermission] = MediaLibrary.usePermissions();
	const binCount = useTrash().length;

	if (!permission?.granted) {
		return (
			<View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
				<Text style={styles.textLight}>Gallery needs access to your photos.</Text>
				<Pressable
					style={styles.button}
					onPress={() => (permission?.canAskAgain ? requestPermission() : Linking.openSettings())}
				>
					<Text style={styles.textLight}>
						{permission?.canAskAgain ? 'Allow access' : 'Open settings'}
					</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
			<Text style={styles.textLight}>Settings</Text>

			<Text style={styles.textLight}>Permission Status: {permission?.status} </Text>

			<Link href="/recycle" asChild>
				<Pressable style={styles.row}>
					<Lucide name="trash-2" size={22} color="white" />
					<Text style={styles.textLight}>Recycle bin ({binCount})</Text>
				</Pressable>
			</Link>
		</View>
	)
}

export default Settings

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: 'black', paddingBottom: 100, paddingHorizontal: 30 },
	textLight: { color: 'white' },
	button: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, backgroundColor: '#4f46e5' },
	row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24, paddingVertical: 12 },
});
