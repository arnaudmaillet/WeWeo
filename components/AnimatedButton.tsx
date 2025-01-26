import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import React, { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AnimatedButtonProps = {
    style?: object;
    textStyle?: object;
    className?: string;
    textClassName?: string;
    children?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    iconMargin?: number;
    isActive?: boolean;
    defaultBackgroundColor?: string;
    defaultTextColor?: string;
    activeBackgroundColor?: string;
    activeTextColor?: string;
    transition?: boolean;
    animation?: boolean;
    duration?: number;
    feedback?: "light" | "medium" | "heavy";
    onPress?: () => void;
};

const AnimatedButton = ({
    style = {},
    textStyle = {},
    className,
    textClassName,
    children = 'Bouton',
    leftIcon = null,
    rightIcon = null,
    iconMargin = 2,
    isActive = false,
    defaultBackgroundColor = 'transparent',
    defaultTextColor = '#000000',
    activeBackgroundColor,
    activeTextColor,
    transition = false,
    animation = false,
    duration = 50,
    feedback,
    onPress,
}: AnimatedButtonProps) => {

    const backgroundColor = useSharedValue(isActive ? activeBackgroundColor || defaultBackgroundColor : defaultBackgroundColor);
    const textColor = useSharedValue(isActive ? activeTextColor || defaultTextColor : defaultTextColor);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: transition && activeBackgroundColor
            ? withTiming(backgroundColor.value, { duration: duration })
            : backgroundColor.value,
        transform: [{ scale: scale.value }],
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        color: transition && activeTextColor
            ? withTiming(textColor.value, { duration: duration })
            : textColor.value,
    }));

    const handlePress = () => {
        if (animation) {
            scale.value = withSequence(
                withSpring(1.1, { mass: 0.02 }),
                withSpring(1, { mass: 0.02 })
            );
        }

        if (activeBackgroundColor) {
            backgroundColor.value = isActive ? defaultBackgroundColor : activeBackgroundColor;
        }
        if (activeTextColor) {
            textColor.value = isActive ? defaultTextColor : activeTextColor;
        }

        if (feedback === "light") impactAsync(ImpactFeedbackStyle.Light);
        if (feedback === "medium") impactAsync(ImpactFeedbackStyle.Medium);
        if (feedback === "heavy") impactAsync(ImpactFeedbackStyle.Heavy);

        if (onPress) {
            onPress();
        }
    };

    return (
        <AnimatedPressable
            style={[!className && style, animatedStyle, { flexDirection: 'row', alignItems: 'center' }]}
            className={className}
            onPress={handlePress}
        >
            {leftIcon && (
                <View style={{ marginRight: iconMargin }}>{leftIcon}</View>
            )}
            <Animated.Text
                style={[!textClassName && textStyle, animatedTextStyle]}
                className={textClassName}
            >{children}</Animated.Text>
            {rightIcon && (
                <View style={{ marginLeft: iconMargin }}>{rightIcon}</View>
            )}
        </AnimatedPressable>
    );
};

export default AnimatedButton;
