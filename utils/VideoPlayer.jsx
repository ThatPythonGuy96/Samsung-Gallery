import { useEffect, useState } from 'react';
import * as MediaLibrary from 'expo-media-library/legacy';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { VideoView } from 'expo-video';

export function VideoPlayer({ item, active, width, player }) {
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!active) return;
        let cancelled = false;
        setError(false);

        (async () => {
            try {
                const info = await MediaLibrary.getAssetInfoAsync(item.id);
                if (cancelled) return;
                await player.replaceAsync(info.localUri ?? info.uri);
                if (cancelled) return; // screen closed or swiped away while loading
                player.play();
                setReady(true);
            } catch {
                if (!cancelled) setError(true);
            }
        })();

        return () => {
            cancelled = true;
            setReady(false); // no pause here, since the player may already be released
        };
    }, [active, item.id, player]);

    return (
        <View style={{ width, height: '100%' }}>
            <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFill} resizeMode="contain" />
            {active && ready && (
                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFill}
                    contentFit="contain"
                    nativeControls={false}
                />
            )}
            {active && !ready && !error && <ActivityIndicator color="#fff" style={StyleSheet.absoluteFill} />}
            {error && <Text style={styles.errorText}>Couldn't load this video.</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    errorText: { color: 'white', textAlign: 'center', position: 'absolute', bottom: 20, width: '100%' },
});