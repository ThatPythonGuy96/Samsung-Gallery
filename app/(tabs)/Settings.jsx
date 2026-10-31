import { StyleSheet, Text, View, Pressable, Linking } from 'react-native'
import React from 'react';
import * as MediaLibrary from 'expo-media-library/legacy';

const Settings = () => {
	const [permission, requestPermission] = MediaLibrary.usePermissions();

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
		</View>
	)
}

export default Settings

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: 'black', paddingBottom: 100, paddingHorizontal: 30 },
	textLight: { color: 'white' },
	button: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, backgroundColor: '#4f46e5' },
});