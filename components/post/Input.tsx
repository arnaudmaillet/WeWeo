import React, { FC, useEffect, useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '~/constants/constants';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, ZoomIn, ZoomInEasyDown, ZoomOut } from 'react-native-reanimated';
import { useKeyboard } from '~/contexts/KeyboardProvider';
import { ActivityIndicator, TextInputProps, View } from 'react-native';
import { Image } from 'expo-image';

type InputProps = TextInputProps & {
    isActive?: boolean
    placeholder?: string
    activePlaceholder?: string
    isIconVisible?: boolean
    onIconPress?: () => void
}

const Input: FC<InputProps> = ({
    placeholder = '',
    activePlaceholder = '',
    isIconVisible = false,
    isActive = false,
    onIconPress,
    ...rest
}: InputProps) => {
    const { isKeyboardVisible } = useKeyboard()
    const [message, setMessage] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false)
    const [isUserIconLoading, setIsUserIconLoading] = useState<boolean>(false)

    const backgroundColor = useSharedValue(isActive ? THEME.colors.grayscale.darker_2x : THEME.colors.grayscale.main);

    useEffect(() => {
        backgroundColor.value = withTiming(
            isActive ? THEME.colors.grayscale.darker_2x : THEME.colors.grayscale.main,
            { duration: 150 }
        );
    }, [isActive]);

    useEffect(() => {
        setIsTyping(message !== '')
    }, [message])

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: backgroundColor.value,
    }));

    const handleSendMessage = () => { };

    return (
        <View className='flex-row flex-auto gap-2'>
            {
                isIconVisible && <View className='flex-row items-center gap-[5px]'>
                    <TouchableOpacity onPress={onIconPress}>
                        <Animated.View key={isActive.toString()}>
                            {
                                isActive ?
                                    <Animated.View entering={ZoomInEasyDown.springify().mass(.2)} exiting={ZoomOut.springify().mass(.2)} className='w-[35] h-[35] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden self-center'>
                                        <MaterialCommunityIcons name="incognito" size={24} color="gray" />
                                    </Animated.View> :
                                    <Animated.View entering={ZoomInEasyDown.springify().mass(.2)} exiting={ZoomOut.springify().mass(.2)} className='w-[35] h-[35] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden self-center'>
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
                                    </Animated.View>
                            }
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            }
            <Animated.View
                style={[animatedStyle, { borderRadius: 25, paddingHorizontal: 12 }]}
                className="flex-auto flex-row items-center"
            >
                <TextInput
                    className="flex-auto w-36 h-10"
                    placeholder={isKeyboardVisible ? activePlaceholder === '' ? placeholder : activePlaceholder : placeholder}
                    onChangeText={(text) => {
                        setMessage(text)
                    }}
                    value={message}
                    {...rest}
                />
                <TouchableOpacity onPress={handleSendMessage}>
                    <Animated.View
                        key={isTyping.toString()}
                        entering={ZoomIn.springify().mass(0.2)}
                        className="h-[25px] w-[25px] items-center justify-center"
                    >
                        {isTyping ? (
                            <MaterialCommunityIcons name="arrow-up-circle" size={25} color={THEME.colors.primary} />
                        ) : (
                            <FontAwesome6 name="microphone" size={18} color={THEME.colors.grayscale.darker_3x} />
                        )}
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default Input;
