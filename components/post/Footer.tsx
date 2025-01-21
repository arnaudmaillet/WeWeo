import { View, KeyboardAvoidingView, Text } from 'react-native'
import React, { FC, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Input from './Input'
import { useKeyboard } from '~/contexts/KeyboardProvider'
import Animated, { ZoomInEasyDown, ZoomOut } from 'react-native-reanimated'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { THEME } from '~/constants/constants'
import { Image } from 'expo-image';
import { useUserStore } from '~/store/useUserStore'
import useNumberFormatter from '~/hooks/useNumberFormatter'

interface FooterProps {
    keyboardVerticalOffset: number
    comments: number
}

const Footer: FC<FooterProps> = ({ keyboardVerticalOffset, comments }: FooterProps) => {

    const { isIncognito, setIsIncognito } = useUserStore()
    const { isKeyboardVisible } = useKeyboard()

    const [isLiked, setIsLiked] = useState<boolean>(false)
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false)

    const { formatNumber } = useNumberFormatter()

    return (
        <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={keyboardVerticalOffset}>
            <View className='bg-grayscale-lighter_1x rounded-2xl shadow shadow-gray-400/20 mx-3.5'>
                <View className='overflow-hidden flex-row p-3 gap-2'>
                    {
                        !isKeyboardVisible ? <View className='flex-row gap-1'>
                            <View className='flex-row items-center justify-center gap-[4px]'>
                                <MaterialCommunityIcons name="eye" size={24} color={THEME.colors.grayscale.darker_3x} />
                                <Text className='text-gray-700 font-medium text-sm'>52.3k</Text>
                            </View>
                            <View className='flex-row items-center justify-center gap-[4px]'>
                                <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
                                    <MaterialCommunityIcons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? '#E05A5A' : THEME.colors.grayscale.darker_3x} />
                                </TouchableOpacity>
                                <Text className='text-gray-700 font-medium text-sm'>11.2k</Text>
                            </View>
                            <View className='items-center justify-center'>
                                <TouchableOpacity onPress={() => setIsBookmarked(!isBookmarked)}>
                                    <MaterialCommunityIcons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={24} color={isBookmarked ? THEME.colors.primary : THEME.colors.grayscale.darker_3x} />
                                </TouchableOpacity>
                            </View>
                        </View> :
                            <View className='flex-row items-center gap-[5px]'>
                                <TouchableOpacity onPress={() => setIsIncognito(!isIncognito)}>
                                    <Animated.View key={isIncognito.toString()}>
                                        {
                                            isIncognito ?
                                                <Animated.View entering={ZoomInEasyDown.springify().mass(.2)} exiting={ZoomOut.springify().mass(.2)} className='w-[35] h-[35] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden self-center'>
                                                    <MaterialCommunityIcons name="incognito" size={24} color="gray" />
                                                </Animated.View> :
                                                <Animated.View entering={ZoomInEasyDown.springify().mass(.2)} exiting={ZoomOut.springify().mass(.2)} className='w-[35] h-[35] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden self-center'>
                                                    <Image
                                                        source={'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker5.gif'}
                                                        style={{ height: 35, width: 35 }}
                                                        contentFit="contain"
                                                        allowDownscaling={false}
                                                    />
                                                </Animated.View>

                                        }
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>
                    }
                    <Input placeholder={comments > 0 ? `${formatNumber(comments)} comments` : 'No comments'} />
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default Footer