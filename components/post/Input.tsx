import React, { FC, useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '~/constants/constants';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from 'react-native-reanimated';
import { useUserStore } from '~/store/useUserStore';

interface InputProps {
    placeholder?: string
}

const Input: FC<InputProps> = ({ placeholder = '' }: InputProps) => {
    const { isIncognito } = useUserStore();
    const [message, setMessage] = useState<string>('');

    const isTyping = message !== '';

    const backgroundColor = useSharedValue(isIncognito ? THEME.colors.grayscale.darker_2x : THEME.colors.grayscale.main);

    React.useEffect(() => {
        backgroundColor.value = withTiming(
            isIncognito ? THEME.colors.grayscale.darker_2x : THEME.colors.grayscale.main,
            { duration: 150 }
        );
    }, [isIncognito]);

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: backgroundColor.value,
    }));

    const handleSendMessage = () => { };

    return (
        <Animated.View
            style={[animatedStyle, { borderRadius: 25, paddingHorizontal: 12 }]}
            className="flex-auto flex-row items-center"
        >
            <TextInput
                className="flex-auto w-36 h-10"
                placeholder={placeholder}
                onChangeText={setMessage}
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
    );
};

export default Input;
