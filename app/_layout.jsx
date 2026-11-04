import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MediaProvider, useAssets, useMedia } from '../context/MediaContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

SplashScreen.preventAutoHideAsync();

function AppShell() {
    const { ready, permission, requestPermission } = useMedia();
    const { assets, loadMore } = useAssets();
    const [timedOut, setTimedOut] = useState(false);
    const { loaded } = useSettings();
    const show = (ready && loaded && assets) || timedOut;


    useEffect(() => {
        const t = setTimeout(() => setTimedOut(true), 5000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (show) SplashScreen.hideAsync();
    }, [show]);

    if (!show) return null;

    if (!permission?.granted) {
        return (
            requestPermission()
        );
    }

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="album/[id]" options={{ headerShown: false, animation: 'simple_push' }} />
            <Stack.Screen name="media/[id]" options={{ headerShown: false, animation: 'simple_push' }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <SafeAreaProvider>
                <SettingsProvider>
                    <MediaProvider>
                        <AppShell />
                    </MediaProvider>
                </SettingsProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}