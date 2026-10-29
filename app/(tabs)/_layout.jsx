import { Tabs } from "expo-router";
import FloatingTabBar from "../../components/TabBar";

export default function _layout() {
    return (
        <Tabs 
            tabBar={(props) => <FloatingTabBar {...props} />} 
            screenOptions={{ headerShown: false, animation: 'fade' }}
        >
            <Tabs.Screen name="Pictures" options={{ title: 'Pictures' }} />
            <Tabs.Screen name="Albums" options={{ title: 'Albums' }} />
            <Tabs.Screen name="Settings" options={{ title: 'Settings' }} />
        </Tabs>
            
    )
}