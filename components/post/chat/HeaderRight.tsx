import { ActivityIndicator, View } from 'react-native'
import React, { FC, useState } from 'react'
import Animated, { ZoomInLeft } from 'react-native-reanimated'
import { Image } from 'expo-image'

const HeaderRight: FC = () => {
    const [isUserIconLoading, setIsUserIconLoading] = useState<boolean>(false)
    return (
        <View className='w-[35] h-[35] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden self-center'>
            {
                !isUserIconLoading && <ActivityIndicator size='small' style={{ position: 'absolute', alignSelf: 'center' }} />
            }
            <Image
                source={'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker5.gif'}
                style={{ height: 35, width: 35, zIndex: 10 }}
                contentFit="contain"
                allowDownscaling={false}
                onLoadEnd={() => setIsUserIconLoading(true)}
            />
        </View>
    )
}

export default HeaderRight