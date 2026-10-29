import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lucide } from '@react-native-vector-icons/lucide';

const ICONS = {
    Pictures: 'images',
    Albums: 'gallery-vertical-end',
    Settings: 'square-menu',
};

export default function FloatingTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();

    return (
        <View
            pointerEvents="box-none"
            style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) }]}
        >
            <View style={styles.bar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel ?? options.title ?? route.name;
                    const focused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!focused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () =>
                        navigation.emit({ type: 'tabLongPress', target: route.key });

                    const iconName = ICONS[route.name] ?? 'ellipse';

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={focused ? { selected: true } : {}}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={[styles.tab, focused && styles.tabActive]}
                        >
                            <Lucide
                                name={iconName}
                                size={17}
                                color={focused ? '#fff' : '#8e8e93'}
                            />
                            <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    bar: {
        flexDirection: 'row',
        backgroundColor: '#1c1c1e',
        borderRadius: 32,
        padding: 8,
        width: '70%',
        justifyContent: 'space-around',
        elevation: 15,
        shadowColor: '#fcfcfc',
    },
    tab: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 11,
        borderRadius: 16,
        gap: 6,
    },
    tabActive: {
        backgroundColor: '#2c2e35',
        flexDirection: 'column',
        borderColor: '#c2bebe',
        borderWidth: .5
    },
    label: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 10,
    },
    labelActive: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 11
    }
});