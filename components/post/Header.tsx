import { LayoutChangeEvent, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
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
    onLayout?: (event: LayoutChangeEvent) => void
}

const Header: React.FC<IHeader> = ({ post, isCurrentPost, onLayout }: IHeader) => {
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    const buttonBackgroundColor = useSharedValue(
        isFollowing ? THEME.colors.primary : THEME.colors.grayscale.darker_1x
    );

    useEffect(() => {
        buttonBackgroundColor.value = withTiming(
            isFollowing ? THEME.colors.primary : THEME.colors.grayscale.darker_1x,
            { duration: 150 }
        );
    }, [isFollowing]);

    const animatedFollowStyle = useAnimatedStyle(() => ({
        backgroundColor: buttonBackgroundColor.value,
    }));

    return (
        <View className="flex p-5 gap-5 bg-grayscale-lighter_1x rounded-2xl border border-neutral-100 shadow-inner z-10 mx-3.5" onLayout={onLayout}>
            <View className="flex-row gap-4">
                <View className="w-[50] h-[50] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden">
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
                    style={{ transform: [{ translateX: -2.5 }, { translateY: -2.5 }] }}
                    progress={isCurrentPost ? 0.2 : 0}
                    size={55}
                    borderWidth={0}
                    color={THEME.colors.primary}
                    unfilledColor={THEME.colors.grayscale.lighter_1x}
                    strokeCap="round"
                    direction="counter-clockwise"
                />
                <View className="flex flex-auto gap-[5px]">
                    <View className="flex-row gap-[5px] items-center">
                        <Text className="font-semibold text-gray-700">Arnaud M</Text>
                        <Text className="text-sm text-gray-300">- 2m</Text>
                    </View>
                    <View className="flex-auto flex-row items-center gap-[5px]">
                        <View className="w-[25] h-[25] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden self-center">
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
                                style={animatedFollowStyle}
                                className="h-[25px] rounded-lg justify-center"
                            >
                                <Text
                                    className={`text-xs px-4 font-medium ${isFollowing ? 'text-white' : 'text-gray-400'
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
                            color={THEME.colors.grayscale.darker_3x}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex-auto">
                <Text className="text-xl font-bold text-gray-600">How to manage your money</Text>
            </View>
            <View className="flex-auto">
                <Text className="font-medium text-gray-400">
                    {post.label.length > 0 ? post.label : 'test'}
                </Text>
            </View>
        </View>
    );
};

export default Header;
