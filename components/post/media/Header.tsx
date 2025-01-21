import { Text, View } from 'react-native';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { IMarker } from '~/contexts/markers/types';
import { THEME } from '~/constants/constants';
import { Circle } from 'react-native-progress';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface IHeader {
    post: IMarker;
    isCurrentPost: boolean;
    isVisible: boolean;
}

const Header: React.FC<IHeader> = ({ post, isCurrentPost, isVisible }: IHeader) => {
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    const buttonBackgroundColor = useSharedValue(
        isFollowing ? THEME.colors.primary : THEME.colors.grayscale.darker_3x
    );

    const opacity = useSharedValue(1)
    const scale = useSharedValue(1)

    const animatedFollowBackground = useAnimatedStyle(() => ({
        backgroundColor: buttonBackgroundColor.value,
    }));

    const animatedHeader = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    useEffect(() => {
        buttonBackgroundColor.value = withTiming(
            isFollowing ? THEME.colors.primary : THEME.colors.grayscale.darker_3x,
            { duration: 150 }
        );
    }, [isFollowing]);

    useEffect(() => {
        opacity.value = withTiming(isVisible ? 1 : .2, { duration: 300 })
        scale.value = withTiming(isVisible ? 1 : .97, { duration: 300 })
    }, [isVisible])


    return (
        <Animated.View
            style={animatedHeader}
            className="absolute left-3.5 right-3.5 bottom-10 bg-black/50 rounded-2xl flex p-5 gap-5"
            pointerEvents={isVisible ? 'auto' : 'none'}
        >
            <View className="flex-row gap-4">
                <View className="w-[50] h-[50] z-10 bg-grayscale-darker_2x/50 rounded-full justify-center items-center overflow-hidden">
                    <Image
                        source={{
                            uri: post.icon
                                ? post.icon
                                : 'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker1.gif',
                        }}
                        style={{ height: 40, width: 40 }}
                        contentFit="contain"
                        allowDownscaling={false}
                    />
                </View>
                <Circle
                    className="absolute"
                    progress={isCurrentPost ? 0.2 : 0}
                    size={50}
                    borderWidth={0}
                    color={THEME.colors.primary}
                    strokeCap="round"
                    direction="counter-clockwise"
                />
                <View className="flex flex-auto gap-[5px]">
                    <View className="flex-row gap-[5px] items-center">
                        <Text className="font-semibold text-gray-200">Arnaud M</Text>
                        <Text className="text-sm text-gray-400">- 2m</Text>
                    </View>
                    <View className="flex-auto flex-row items-center gap-[5px]">
                        <View className="w-[25] h-[25] z-10 bg-grayscale-darker_2x/50 rounded-full justify-center items-center overflow-hidden self-center">
                            <Image
                                source={{
                                    uri: post.icon
                                        ? post.icon
                                        : 'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker4.gif',
                                }}
                                style={{ height: 25, width: 25 }}
                                contentFit="contain"
                                allowDownscaling={false}
                            />
                        </View>
                        <TouchableWithoutFeedback onPress={() => setIsFollowing(!isFollowing)}>
                            <Animated.View
                                style={animatedFollowBackground}
                                className="h-[25px] rounded-lg justify-center"
                            >
                                <Text
                                    className={`text-xs px-4 font-medium ${isFollowing ? 'text-white' : 'text-gray-100'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                        <View className="flex-1" />
                    </View>
                </View>
                <View className="justify-center">
                    <TouchableOpacity>
                        <MaterialIcons
                            name="ios-share"
                            size={24}
                            color={THEME.colors.grayscale.darker_2x}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex-auto">
                <Text className="text-xl font-bold text-gray-100">How to manage your money</Text>
            </View>
            <View className="flex-auto">
                <Text className="font-medium text-gray-300">
                    {post.label.length > 0 ? post.label : 'test'}
                </Text>
            </View>
        </Animated.View>
    );
};

export default Header;
