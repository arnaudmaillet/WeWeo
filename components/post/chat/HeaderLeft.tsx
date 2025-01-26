import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { THEME } from '~/constants/constants'
import AnimatedButton from '~/components/AnimatedButton'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'

const HeaderLeft = () => {

    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    return (
        <View className='gap-2'>
            <AnimatedButton
                className='h-[30px] rounded-xl justify-center'
                textClassName='font-medium'
                defaultTextColor='black'
                onPress={() => router.back()}
                isActive={isFollowing}
                transition
                animation
                feedback='light'
                leftIcon={<MaterialIcons name="arrow-back-ios-new" size={20} color="black" />}
            >Back</AnimatedButton>
        </View>
    )
}

export default HeaderLeft