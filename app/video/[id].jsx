import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as MediaLibrary from 'expo-media-library/legacy';
import PhotoTopAction from '../../components/PhotoTopAction';

const Video = () => {
	return (
		<View>
			<Text>Video</Text>
		</View>
	)
}

export default Video

const styles = StyleSheet.create({})