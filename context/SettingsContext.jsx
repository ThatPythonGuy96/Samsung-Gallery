import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { File, Paths } from 'expo-file-system';

const DEFAULTS = { lastTab: 'Pictures', "albumsColumns": 3, "picturesColumns": 3, "albumColumns": 3 };
const file = new File(Paths.document, 'settings.json');

async function readSettings() {
	try {
		if (!file.exists) return DEFAULTS;
		const saved = JSON.parse(await file.text());
		return { ...DEFAULTS, ...saved };
	} catch {
		return DEFAULTS; // unreadable or corrupted file
	}
}

function writeSettings(settings) {
	try {
		if (!file.exists) file.create();
		file.write(JSON.stringify(settings));
	} catch (e) {
		console.warn('Failed to save settings', e);
	}
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
	const [settings, setSettings] = useState(DEFAULTS);
	const [loaded, setLoaded] = useState(false);
	const latest = useRef(DEFAULTS); // so two quick updates never overwrite each other

	useEffect(() => {
		readSettings().then((s) => {
			latest.current = s;
			setSettings(s);
			setLoaded(true);
		});
	}, []);

	const update = useCallback((patch) => {
		const next = { ...latest.current, ...patch };
		if (JSON.stringify(next) === JSON.stringify(latest.current)) return; // nothing changed
		latest.current = next;
		setSettings(next);
		writeSettings(next);
	}, []);

	const value = useMemo(() => ({ settings, update, loaded }), [settings, update, loaded]);

	return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);