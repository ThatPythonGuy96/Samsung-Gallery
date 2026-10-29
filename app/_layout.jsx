import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from "react-native";
// import * as MediaLibrary from 'expo-media-library';

// const [permission, requestPermission] = MediaLibrary.usePermissions();

// if (!permission?.granted) {
//   // show a screen with a button that calls requestPermission()
// }

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar value="auto" />
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="photo/[id]" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
                <Stack.Screen name="album/[name]" options={{ headerShown: false, animation: 'simple_push' }} />
            </Stack>
        </GestureHandlerRootView>
    )
}