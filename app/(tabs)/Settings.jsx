import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import Lucide from '@react-native-vector-icons/lucide'

const Settings = () => {
	return (
		<View style={styles.container}>
			<Link href=''>
				<Lucide name='trash' size='24' color='white' />
				<Text style={styles.textLight}>Recyle Bin</Text>
			</Link>
			<Link href=''>
				<Lucide name='trash' size='24' color='white' />
				<Text style={styles.textLight}>Recyle Bin</Text>
			</Link>
			<Link href=''>
				<Lucide name='trash' size='24' color='white' />
				<Text style={styles.textLight}>Recyle Bin</Text>
			</Link>
			<Link href=''>
				<Text style={styles.textLight}>About Gallery</Text>
			</Link>
		</View>
	)
}

export default Settings

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
        paddingBottom: 100,
		paddingHorizontal: 30,
	},
	textLight: {
		color: 'white',
	}
})