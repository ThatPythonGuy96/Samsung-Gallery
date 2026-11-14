import { useEffect, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MediaProvider, useMedia } from '../context/MediaContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

SplashScreen.preventAutoHideAsync();

function PermissionScreen({ permission, requestPermission }) {
    return (
        <View style={{ flex: 1, backgroundColor: 'black', paddingHorizontal: 30, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Gallery needs access to your photos.</Text>
            <Pressable
                style={{ marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, backgroundColor: '#4f46e5' }}
                onPress={() => (permission?.canAskAgain ? requestPermission() : Linking.openSettings())}
            >
                <Text style={{ color: 'white' }}>
                    {permission?.canAskAgain ? 'Allow access' : 'Open settings'}
                </Text>
            </Pressable>
        </View>
    );
}

function AppShell() {
    const { ready, permission, requestPermission } = useMedia();
    const { loaded } = useSettings();
    const [timedOut, setTimedOut] = useState(false);
    const show = (ready && loaded) || timedOut;

    // safety net: never keep the splash up longer than 5 seconds
    useEffect(() => {
        const t = setTimeout(() => setTimedOut(true), 5000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (show) SplashScreen.hideAsync();
    }, [show]);

    if (!show) return null; // native splash is still visible

    if (!permission?.granted) {
        return <PermissionScreen permission={permission} requestPermission={requestPermission} />;
    }

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="album/[id]" options={{ headerShown: false, animation: 'simple_push' }} />
            <Stack.Screen name="media/[id]" options={{ headerShown: false, animation: 'simple_push' }} />
            <Stack.Screen name="recycle" options={{ headerShown: false, animation: 'simple_push' }} />
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
