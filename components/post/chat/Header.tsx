import { LayoutChangeEvent, Text, View } from 'react-native';
import React, { memo, useState } from 'react';
import { Image } from 'expo-image';
import { IMarker } from '@contexts/markers/types';
import { THEME } from '@constants/constants';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedButton from '~/components/AnimatedButton';

type HeaderProps = {
    post: IMarker;
    onLayout?: (event: LayoutChangeEvent) => void
}

const Header: React.FC<HeaderProps> = ({
    post,
    onLayout,
}: HeaderProps) => {
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isJoinable, setIsJoinable] = useState<boolean>(false);

    return (
        <View className="flex px-5 py-4 bg-grayscale-lighter_1x/90 rounded-2xl z-10" onLayout={onLayout}>
            <View onLayout={onLayout} className='gap-1'>
                <View className='flex-1 flex-row justify-between'>
                    <View className='flex-row items-center'>
                        <MaterialIcons name="location-on" size={12} color={THEME.colors.grayscale.darker_1x} />
                        <Text className='text-xs text-gray-400'>USA, Los Angeles</Text>
                    </View>
                    <View className='flex-row items-center justify-end'>
                        <Text className='text-xs text-gray-400'>China, Chengdu</Text>
                        <MaterialIcons name="location-on" size={12} color={THEME.colors.grayscale.darker_1x} />
                    </View>
                </View>
                <View className='flex-1 flex-row justify-between'>
                    <Text className="font-semibold text-gray-700">Arnaud M</Text>
                    <Text className="font-semibold text-gray-700">Anonymous-2847657</Text>
                </View>
                <View className='flex-1 flex-row justify-between mt-2'>
                    <View className="flex-row flex-1 items-center gap-[5px]">
                        <View className="w-[30] h-[30] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden self-center">
                            <Image
                                source={{
                                    uri: post.icon
                                        ? post.icon
                                        : 'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker4.gif',
                                }}
                                style={{ height: 30, width: 30 }}
                                contentFit="contain"
                                allowDownscaling={false}
                            />
                        </View>
                        <AnimatedButton
                            className='h-[30px] py-1 px-3 rounded-xl justify-center'
                            textClassName='text-sm font-medium'
                            defaultBackgroundColor={THEME.colors.grayscale.darker_1x}
                            defaultTextColor='gray'
                            activeBackgroundColor={THEME.colors.primary}
                            activeTextColor='white'
                            onPress={() => setIsFollowing(!isFollowing)}
                            isActive={isFollowing}
                            transition
                            animation
                            feedback='light'
                        >{isFollowing ? "Following" : "Follow"}</AnimatedButton>
                    </View>
                    <View className="flex-row flex-1 items-center gap-[5px] justify-end">
                        <AnimatedButton
                            className='h-[30px] py-1 px-3 rounded-xl justify-center'
                            textClassName='text-sm font-medium'
                            defaultBackgroundColor={THEME.colors.grayscale.darker_1x}
                            defaultTextColor='gray'
                            activeBackgroundColor={THEME.colors.primary}
                            activeTextColor='white'
                            onPress={() => setIsJoinable(!isJoinable)}
                            isActive={isJoinable}
                            transition
                            animation
                            feedback='light'
                        >Report</AnimatedButton>
                        <View className="w-[30] h-[30] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden self-center">
                            <Image
                                source={{
                                    uri: post.icon
                                        ? post.icon
                                        : 'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker4.gif',
                                }}
                                style={{ height: 30, width: 30 }}
                                contentFit="contain"
                                allowDownscaling={false}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default memo(Header);
