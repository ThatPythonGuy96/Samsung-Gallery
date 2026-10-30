import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MediaProvider } from '../context/MediaContext'

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar value="auto" />
            <SafeAreaProvider>
                <MediaProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="photo/[id]" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
                        <Stack.Screen name="album/[id]" options={{ headerShown: false, animation: 'simple_push' }} />
                    </Stack>
                </MediaProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}