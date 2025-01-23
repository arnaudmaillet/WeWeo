import { Stack } from "expo-router";

const Layout = () => {
    return (
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: 'black' } }} />
        </Stack>
    );
};

export default Layout