import { Tabs } from "expo-router";
import FloatingTabBar from "../../components/TabBar";
import { useSettings } from '../../context/SettingsContext';

const TAB_NAMES = ['index', 'Albums', 'Settings'];

export default function _layout() {
    const { settings, update } = useSettings();
	const initial = TAB_NAMES.includes(settings.lastTab) ? settings.lastTab : 'index';

    return (
        <Tabs 
            initialRouteName={initial}
            tabBar={(props) => <FloatingTabBar {...props} />} 
            screenOptions={{ headerShown: false, animation: 'fade' }}
            screenListeners={({ route }) => ({
				focus: () => update({ lastTab: route.name }), // fires whenever a tab becomes active
			})}
        >
            <Tabs.Screen name="index" options={{ title: 'Picture', animation: 'fade' }} />
            <Tabs.Screen name="Albums" options={{ title: 'Albums', animation: 'fade' }} />
            <Tabs.Screen name="Settings" options={{ title: 'Settings', animation: 'fade' }} />
        </Tabs>
            
    )
}