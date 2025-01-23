import { View, Text } from 'react-native'
import React, { FC } from 'react'
import Animated from 'react-native-reanimated'

const Agent: FC = () => {
    return (
        <View className='gap-3 p-3'>
            <View className='flex-row h-[25px] justify-between items-center'>
                <Animated.Text className='font-semibold text-gray-400 text-2xl'>AI Agent</Animated.Text>
            </View>
            <Text className='leading-relaxed text-gray-700'>On sait depuis longtemps que travailler avec du texte lisible et contenant du sens est source de distractions, et empêche de se concentrer sur la mise en page elle-même. L'avantage du Lorem Ipsum sur un texte générique comme 'Du texte. Du texte. Du texte.' est qu'il possède une distribution de lettres plus ou moins normale, et en tout cas comparable avec celle du français standard.</Text>
        </View>
    )
}

export default Agent