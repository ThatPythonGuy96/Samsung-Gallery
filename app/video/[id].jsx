import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as MediaLibrary from 'expo-media-library/legacy';
import PhotoTopAction from '../../components/PhotoTopAction';

// split out so the player is only created once the uri is known
function Player({ uri }) {
    const player = useVideoPlayer(uri, (p) => {
        p.play();
    });

    return (
        <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls
            allowsFullscreen
            allowsPictureInPicture
        />
    );
}

export default function VideoScreen() {
    const { id } = useLocalSearchParams();
    const [uri, setUri] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        MediaLibrary.getAssetInfoAsync(id)
            .then((info) => {
                if (!cancelled) setUri(info.localUri ?? info.uri);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <View style={styles.container}>
            {uri ? (
                <Player uri={uri} />
            ) : error ? (
                <Text style={styles.text}>Couldn't load this video.</Text>
            ) : (
                <ActivityIndicator color="#fff" />
            )}
            <PhotoTopAction />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
    video: { flex: 1, width: '100%' },
    text: { color: 'white', textAlign: 'center' },
});