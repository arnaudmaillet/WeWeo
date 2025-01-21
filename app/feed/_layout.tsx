import { Stack } from "expo-router";

const PostLayout = () => {
    return (
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: 'transparent' } }} />
        </Stack>
    );
};

export default PostLayout