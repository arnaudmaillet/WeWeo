import React, { FC, memo, useState } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { THEME } from '~/constants/constants'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { router } from 'expo-router'


interface Dimensions {
    height: number
    width: number
}

interface ImageProps {
    self: string
    active: number
    fromList: string[]
    dimensions?: Dimensions
    gap?: number
    overlayLabel?: string
    maxItemsVisible?: number
}

const Image: FC<ImageProps> = ({ self, active, fromList, dimensions = { height: 50, width: 50 }, gap = 0, overlayLabel, maxItemsVisible }: ImageProps) => {

    const [isLoading, setIsLoading] = useState<boolean>(true)

    return (
        <View
            style={{
                margin: gap,
                borderRadius: 8,
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <TouchableWithoutFeedback onPress={() => router.push({
                pathname: `/feed/viewer/`,
                params: { data: JSON.stringify(fromList), active: active.toString() }
            })}>
                {
                    isLoading && <View
                        style={{
                            height: dimensions.height,
                            width: dimensions.width,
                            backgroundColor: THEME.colors.grayscale.darker_2x,
                            position: 'absolute',
                            justifyContent: 'center'
                        }}
                    >
                        <ActivityIndicator className='self-center' color={THEME.colors.grayscale.darker_3x} />
                    </View>
                }

                {
                    overlayLabel && <View
                        style={{
                            height: dimensions.height,
                            width: dimensions.width,
                        }}
                        className='absolute justify-center items-center z-10 bg-black/40'
                    >
                        <Text className='text-2xl text-gray-200 font-medium'>+{overlayLabel}</Text>
                    </View>
                }

                <ExpoImage
                    source={self}
                    style={{
                        height: dimensions.height,
                        width: dimensions.width,
                    }}
                    cachePolicy="memory"
                    onLoadEnd={() => setIsLoading(false)}
                    transition={300}
                />
            </TouchableWithoutFeedback>
        </View>

    )
}

export default memo(Image)
