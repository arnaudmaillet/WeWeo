import { Stack } from "expo-router";

const Layout = () => {
    return (
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: 'transparent' } }} />
            <Stack.Screen name="viewer" options={{ title: 'Viewer', animation: 'slide_from_bottom', gestureDirection: 'vertical', contentStyle: { borderRadius: 20, overflow: "hidden" } }} />
            <Stack.Screen name="chat" options={{ title: 'Chat' }} />
        </Stack>
    );
};

export default Layout