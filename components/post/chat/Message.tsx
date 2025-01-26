import React, { memo, useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { IMessage } from '~/types/MarkerInterfaces';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { THEME } from '~/constants/constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { BounceIn, FadeIn, SlideInLeft, ZoomIn } from 'react-native-reanimated';


type MessageProps = {
    self: IMessage;
};

const Message: React.FC<MessageProps> = ({ self }) => {
    return (
        <Animated.View className="py-2 px-3 gap-[5px]" entering={FadeIn.springify().mass(.2)}>
            <View className="flex-row gap-[4px] items-center">
                <View className="w-[20px] h-[20px] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden">
                    <Image
                        source={{ uri: 'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker1.gif' }}
                        style={{ height: 20, width: 20 }}
                        contentFit="contain"
                        allowDownscaling={false}
                    />
                </View>
                <View className='flex-row items-baseline gap-[5px]'>
                    <Text className="font-medium text-gray-400">Arnaud.maillet</Text>
                    <Text className="text-gray-300 text-xs">- 2m</Text>
                </View>
            </View>
            <View>
                <Text className='text-gray-700'>{self.content}</Text>
            </View>
        </Animated.View>
    );
};

export default memo(Message)
