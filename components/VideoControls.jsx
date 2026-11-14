import { Pressable, StyleSheet, Text } from 'react-native';
import { useEvent } from 'expo';
import { Lucide } from '@react-native-vector-icons/lucide';
import { formatDuration } from '../utils/format';

// owns the play/pause button and the clock, so the 2-per-second time updates
// re-render only this pill and never the pager or the strip
export default function VideoControls({ player, duration }) {
    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
    const { currentTime } = useEvent(player, 'timeUpdate', { currentTime: player.currentTime });

    const togglePlay = () => {
        if (isPlaying) player.pause();
        else if (duration && currentTime >= duration - 0.3) player.replay(); // finished: start over
        else player.play();
    };

    return (
        <Pressable style={styles.time} onPress={togglePlay} hitSlop={10}>
            <Lucide name={isPlaying ? 'pause' : 'play'} size={12} color="#fff" />
            <Text style={styles.text}>{formatDuration(currentTime)}</Text>
            <Text style={styles.text}> / </Text>
            <Text style={styles.text}>{formatDuration(duration)}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    time: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    text: { color: '#fff', fontSize: 13, fontWeight: '300' },
});
