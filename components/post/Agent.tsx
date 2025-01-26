import { View, Text } from 'react-native'
import React, { FC } from 'react'
import Animated from 'react-native-reanimated'

const Agent: FC = () => {
    return (
        <View className='gap-2 m-3'>
            <View className='flex-row h-[25px] justify-between items-center mx-2'>
                <Animated.Text className='font-bold text-gray-800 text-lg'>AI Agent</Animated.Text>
            </View>
            <View className='bg-grayscale rounded-2xl py-2 px-3'>
                <Text className='leading-relaxed text-gray-700'>On sait depuis longtemps que travailler avec du texte lisible et contenant du sens est source de distractions, et empêche de se concentrer sur la mise en page elle-même. L'avantage du Lorem Ipsum sur un texte générique comme 'Du texte. Du texte. Du texte.' est qu'il possède une distribution de lettres plus ou moins normale, et en tout cas comparable avec celle du français standard.</Text>
            </View>
        </View>
    )
}

export default Agent