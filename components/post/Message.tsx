import React, { memo, useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { IMessage } from '~/types/MarkerInterfaces';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { THEME } from '~/constants/constants';
import { TouchableOpacity } from 'react-native-gesture-handler';


type MessageProps = {
    self: IMessage;
};

const Message: React.FC<MessageProps> = ({ self }) => {

    const [selected, setSelected] = useState<boolean>(false)

    const handlePress = () => {
        setSelected(!selected)
    }

    return (
        <View className="flex-row justify-between py-2 px-3 gap-2">
            <View className='flex-auto gap-[3px]'>
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
                <View className='flex-row items-center'>
                    <MaterialIcons name="location-on" size={12} color={THEME.colors.grayscale.darker_1x} />
                    <Text className='text-xs text-gray-300'>USA, Los Angeles</Text>
                </View>
            </View>
            <TouchableOpacity onPress={handlePress}>
                <View className='flex'>
                    <View className='self-center'>
                        <MaterialCommunityIcons name="chevron-up" size={24} color={selected ? THEME.colors.primary : THEME.colors.grayscale.darker_2x} />
                    </View>
                    <Text className='text-gray-300 text-xs self-center'>13.5k</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default memo(Message)
