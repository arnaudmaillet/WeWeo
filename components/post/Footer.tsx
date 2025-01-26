import { View, KeyboardAvoidingView, Text } from 'react-native'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Input from './Input'
import { useKeyboard } from '~/contexts/KeyboardProvider'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { QUERY_OPTIONS, THEME } from '~/constants/constants'
import { useUserStore } from '~/store/useUserStore'
import useNumberFormatter from '~/hooks/useNumberFormatter'
import useDebounce from '~/hooks/useDebounce'
import { IMarker } from '~/contexts/markers/types'
import { useLikes } from '~/hooks/useLikes'

type FooterProps = {
    post: IMarker
    keyboardVerticalOffset: number
    comments: number
}

const Footer: FC<FooterProps> = ({ post, keyboardVerticalOffset, comments }: FooterProps) => {

    const { isIncognito, setIsIncognito } = useUserStore()
    const { isKeyboardVisible } = useKeyboard()
    const { update } = useLikes(post.markerId)

    const [isLiked, setIsLiked] = useState<boolean>(false)
    const [isBookmarked, setIsBookmarked] = useState<boolean>(false)

    const { formatNumber } = useNumberFormatter()

    const debouncedLike = useDebounce(() => update(isLiked), QUERY_OPTIONS.debounce)

    const onLike = () => {
        setIsLiked((prev) => !prev)
        debouncedLike()
    }

    return (
        <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={keyboardVerticalOffset}>
            <View className='bg-grayscale-lighter_1x rounded-2xl shadow shadow-gray-400/20 mx-3.5'>
                <View className='overflow-hidden flex-row p-3 gap-2'>
                    {
                        !isKeyboardVisible && <View className='flex-row gap-1'>
                            <View className='flex-row items-center justify-center gap-[4px]'>
                                <MaterialCommunityIcons name="eye" size={24} color={THEME.colors.grayscale.darker_3x} />
                                <Text className='text-gray-700 font-medium text-sm'>52.3k</Text>
                            </View>
                            <View className='flex-row items-center justify-center gap-[4px]'>
                                <TouchableOpacity onPress={onLike}>
                                    <MaterialCommunityIcons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? '#E05A5A' : THEME.colors.grayscale.darker_3x} />
                                </TouchableOpacity>
                                <Text className='text-gray-700 font-medium text-sm'>11.2k</Text>
                            </View>
                            <View className='items-center justify-center'>
                                <TouchableOpacity onPress={() => setIsBookmarked(!isBookmarked)}>
                                    <MaterialCommunityIcons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={24} color={isBookmarked ? THEME.colors.primary : THEME.colors.grayscale.darker_3x} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    <Input
                        placeholder={comments > 0 ? `${formatNumber(comments)} comments` : 'No comments'}
                        activePlaceholder={isIncognito ? '@anonymous-938354' : '@Arnaud.M'}
                        isActive={isIncognito}
                        isIconVisible={isKeyboardVisible}
                        onIconPress={() => setIsIncognito(!isIncognito)}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default Footer