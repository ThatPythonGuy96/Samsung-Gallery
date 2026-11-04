// hooks/usePinchColumns.js
import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';
import { useSettings } from '../context/SettingsContext';

export function usePinchColumns(key, { min = 2, max = 6 } = {}) {
	const { settings, update } = useSettings();
	const columns = settings[key] ?? 3;

	const change = (delta) => {
		update({ [key]: Math.min(max, Math.max(min, columns + delta)) });
	};

	const gesture = useMemo(
		() =>
			Gesture.Pinch().onEnd((e) => {
				if (e.scale > 1.25) runOnJS(change)(-1); // spread fingers: bigger tiles
				else if (e.scale < 0.8) runOnJS(change)(1); // pinch together: smaller tiles
			}),
		[key, columns, min, max]
	);

	return { columns, gesture };
}