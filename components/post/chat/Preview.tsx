import { View, Text } from 'react-native'
import React, { FC, memo } from 'react'
import { IMessage } from '@contexts/markers/types'
import { Image } from 'expo-image'
import { MaterialIcons } from '@expo/vector-icons'
import { THEME } from '~/constants/constants'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { router } from 'expo-router'

interface PreviewProps {
    data: IMessage[]
}

const Preview: FC<PreviewProps> = ({ data }: PreviewProps) => {

    return (
        <View className='m-3 gap-2'>
            <View className='flex-1 flex-row mx-2 justify-between'>
                <Text className='font-bold text-gray-800 text-lg'>Last Messages</Text>
                <View className="justify-center">
                    <TouchableWithoutFeedback onPress={() => router.push({
                        pathname: `/feed/chat/`,
                        // params: { messages: data }
                    })}>
                        <Text className="text-gray-500 text-sm">View all (+95)</Text>
                    </TouchableWithoutFeedback>
                </View>
            </View>
            <View className='bg-grayscale rounded-2xl p-3 gap-2'>
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
                        <Text className="font-medium text-gray-600">Arnaud.maillet</Text>
                        <Text className="text-gray-500 text-xs">- 2m</Text>
                    </View>
                </View>
                <Text className='text-gray-800 leading-relaxed'>Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1500</Text>
                <View className='flex-row items-center'>
                    <MaterialIcons name="location-on" size={12} color={THEME.colors.grayscale.darker_1x} />
                    <Text className='text-xs text-gray-500'>USA, Los Angeles</Text>
                </View>
            </View>
        </View>
    )
}

export default memo(Preview)