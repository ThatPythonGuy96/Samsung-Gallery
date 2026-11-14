import { memo, useCallback, useEffect, useState } from 'react';
import Animated, {
    clamp,
    useAnimatedStyle,
    useSharedValue,
    withDecay,
    withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';
import ImageView from '../utils/ImageView';

const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const TIMING = { duration: 220 };

// decoding at the photo's real size is only safe for photos that are not huge
const FULL_RES_MAX_SIDE = 4096;
const FULL_RES_MAX_PIXELS = 16_000_000;

// One page of the viewer: pinch to zoom around your fingers, drag while zoomed,
// double-tap to zoom in or out, single tap for onTap (show/hide the controls).
// `zoomed` is owned by the screen, which locks the pager's scrolling while it is true.
function ZoomableImage({ item, width, height, active, zoomed, onTap, onZoomChange }) {
    const scale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);

    // values captured when a gesture starts
    const startScale = useSharedValue(1);
    const startTx = useSharedValue(0);
    const startTy = useSharedValue(0);
    const startFx = useSharedValue(0);
    const startFy = useSharedValue(0);

    // The real size of the photo as decoded (EXIF rotation included). Until it
    // has loaded, fall back to what the library reported.
    const [natural, setNatural] = useState(null);
    const onLoad = useCallback((e) => {
        const { width: w, height: h } = e.source ?? {};
        if (w && h) setNatural({ w, h });
    }, []);

    const iw = natural?.w ?? item.width;
    const ih = natural?.h ?? item.height;

    // how big the photo is on screen at scale 1 (it is letterboxed inside width x height)
    const fit = iw && ih ? Math.min(width / iw, height / ih) : 1;
    const fitW = iw ? iw * fit : width;
    const fitH = ih ? ih * fit : height;

    const fullRes =
        active &&
        !!iw &&
        !!ih &&
        Math.max(iw, ih) <= FULL_RES_MAX_SIDE &&
        iw * ih <= FULL_RES_MAX_PIXELS;

    // leaving the page puts it back to normal
    useEffect(() => {
        if (!active) {
            scale.value = 1;
            tx.value = 0;
            ty.value = 0;
        }
    }, [active, scale, tx, ty]);

    const pinch = Gesture.Pinch()
        .onStart((e) => {
            startScale.value = scale.value;
            startTx.value = tx.value;
            startTy.value = ty.value;
            startFx.value = e.focalX;
            startFy.value = e.focalY;
            runOnJS(onZoomChange)(true); // lock the pager right away
        })
        .onUpdate((e) => {
            const s1 = clamp(startScale.value * e.scale, 1, MAX_SCALE);
            const ratio = s1 / startScale.value;
            const cx = width / 2;
            const cy = height / 2;

            // keep the point you started pinching on under your fingers
            const nx = e.focalX - cx - ratio * (startFx.value - cx - startTx.value);
            const ny = e.focalY - cy - ratio * (startFy.value - cy - startTy.value);

            // never let the photo leave the screen
            const mx = Math.max(0, (fitW * s1 - width) / 2);
            const my = Math.max(0, (fitH * s1 - height) / 2);

            scale.value = s1;
            tx.value = clamp(nx, -mx, mx);
            ty.value = clamp(ny, -my, my);
        })
        .onEnd(() => {
            if (scale.value <= 1.02) {
                scale.value = withTiming(1, TIMING);
                tx.value = withTiming(0, TIMING);
                ty.value = withTiming(0, TIMING);
                runOnJS(onZoomChange)(false);
            }
        });

    const pan = Gesture.Pan()
        .enabled(zoomed && active)
        .maxPointers(1)
        .onStart(() => {
            startTx.value = tx.value;
            startTy.value = ty.value;
        })
        .onUpdate((e) => {
            const mx = Math.max(0, (fitW * scale.value - width) / 2);
            const my = Math.max(0, (fitH * scale.value - height) / 2);
            tx.value = clamp(startTx.value + e.translationX, -mx, mx);
            ty.value = clamp(startTy.value + e.translationY, -my, my);
        })
        .onEnd((e) => {
            const mx = Math.max(0, (fitW * scale.value - width) / 2);
            const my = Math.max(0, (fitH * scale.value - height) / 2);
            tx.value = withDecay({ velocity: e.velocityX, clamp: [-mx, mx] });
            ty.value = withDecay({ velocity: e.velocityY, clamp: [-my, my] });
        });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd((e, success) => {
            if (!success) return;
            if (scale.value > 1.05) {
                scale.value = withTiming(1, TIMING);
                tx.value = withTiming(0, TIMING);
                ty.value = withTiming(0, TIMING);
                runOnJS(onZoomChange)(false);
            } else {
                const s1 = DOUBLE_TAP_SCALE;
                const mx = Math.max(0, (fitW * s1 - width) / 2);
                const my = Math.max(0, (fitH * s1 - height) / 2);
                scale.value = withTiming(s1, TIMING);
                tx.value = withTiming(clamp((width / 2 - e.x) * (s1 - 1), -mx, mx), TIMING);
                ty.value = withTiming(clamp((height / 2 - e.y) * (s1 - 1), -my, my), TIMING);
                runOnJS(onZoomChange)(true);
            }
        });

    const singleTap = Gesture.Tap()
        .maxDuration(250)
        .onEnd((_e, success) => {
            if (success) runOnJS(onTap)();
        });

    // a single tap only counts once it is clear it is not the first half of a double tap
    const taps = Gesture.Exclusive(doubleTap, singleTap);
    const gesture = Gesture.Simultaneous(pinch, pan, taps);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[{ width, height }, animatedStyle]}>
                <ImageView item={item} width={width} height={height} fullRes={fullRes} onLoad={onLoad} />
            </Animated.View>
        </GestureDetector>
    );
}

export default memo(ZoomableImage);
