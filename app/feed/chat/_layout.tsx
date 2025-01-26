import { Stack } from "expo-router";
import HeaderLeft from "@components/post/chat/HeaderLeft";
import HeaderRight from "~/components/post/chat/HeaderRight";

const Layout = () => {
    return (
        <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{
                headerLeft: () => <HeaderLeft />,
                headerRight: () => <HeaderRight />
            }} />
        </Stack>
    );
};

export default Layout