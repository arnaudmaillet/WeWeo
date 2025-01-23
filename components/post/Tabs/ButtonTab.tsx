import React, { memo, useEffect } from 'react';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, { FadeInRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { THEME } from '~/constants/constants';

interface ButtonTabProps {
    index: number;
    label: string;
    isActive: boolean;
    onPress?: () => void;
}

const ButtonTab: React.FC<ButtonTabProps> = ({ index, label, isActive, onPress }) => {
    const backgroundColor = useSharedValue(isActive ? THEME.colors.primary : THEME.colors.grayscale.darker_1x);
    const textColor = useSharedValue(isActive ? 'white' : 'gray');

    useEffect(() => {
        backgroundColor.value = withTiming(isActive ? THEME.colors.primary : THEME.colors.grayscale.darker_1x, { duration: 200 });
        textColor.value = withTiming(isActive ? 'white' : 'gray', { duration: 200 });
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: backgroundColor.value,
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        color: textColor.value,
    }));

    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <Animated.View style={animatedStyle} entering={FadeInRight.springify().delay(index * 50).mass(.3).damping(15)} className={`rounded-xl p-2`}>
                <Animated.Text style={textAnimatedStyle} className='text-xs'>
                    {label}
                </Animated.Text>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

export default memo(ButtonTab);
