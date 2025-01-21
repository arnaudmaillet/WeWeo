import { Text, View } from 'react-native'
import React from 'react'
import SettingsWrapper from '~/components/marker/SettingsWrapper'
import { Image } from 'expo-image';
import { useUserStore } from '~/store/useUserStore'

interface IMarkerHeader { }

const MarkerHeader: React.FC<IMarkerHeader> = () => {

    const { activePost } = useUserStore()

    if (!activePost) return null

    return (
        <View className='p-3 bg-grayscale rounded-3xl flex-row gap-5'>
            <View className='w-[50] h-[50] bg-grayscale-darker_2x rounded-full justify-center items-center'>
                <Image
                    source={{ uri: activePost.icon ? activePost.icon : 'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker1.gif' }}
                    style={{ height: 40, width: 40 }}
                    contentFit="contain"
                />
            </View>
            <Text className='text-gray-600 flex-1'>
                {activePost.label.length > 0 ? activePost.label : 'test'}
            </Text>
        </View>
    )
}

export default MarkerHeader