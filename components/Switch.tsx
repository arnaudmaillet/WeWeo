import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Animated, { interpolateColor, SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { ISwitch } from '~/types/SwitchInterface';
import { THEME } from '~/constants/constants';

interface ISwitchProps {
    props: ISwitch;
}

const Switch: React.FC<ISwitchProps> = ({ props }) => {

    const [switchWidth, setSwitchWidth] = useState<number>(0);
    const [visibility, setVisibility] = useState<number>(0);

    const offset: number = props.label ? 1 : 0;
    const length: number = props.label ? props.buttons.length + offset : props.buttons.length;


    // Animation shared value for the sliding effect
    const slidePosition: SharedValue<number> = useSharedValue(visibility)

    // Shared value for indicator and text color
    const colorValue: SharedValue<number> = useSharedValue(visibility);

    // Update indicator color based on visibility
    useEffect(() => {
        colorValue.value = withTiming(visibility, { duration: 300 });
    }, [visibility]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: slidePosition.value }],
            width: switchWidth / length,
            backgroundColor: interpolateColor(
                colorValue.value,
                props.buttons.map((_, index) => index),
                props.buttons.map((button) => button.color),
            ),
        };
    });


    useEffect(() => {
        if (switchWidth > 0) {
            const buttonWidth = switchWidth / length;
            slidePosition.value = withTiming((visibility + offset) * buttonWidth, { duration: 300 }); // Décalage pour ignorer le bouton "Privacy"
        }
    }, [switchWidth, visibility]);

    // Update position when switch changes with less pronounced spring animation
    const handleSwitchChange = (index: number) => {
        setVisibility(index);
        const buttonWidth = switchWidth / length;
        slidePosition.value = withSpring((index + offset) * buttonWidth, { // Décalage pour ignorer le bouton "Privacy"
            damping: 20,
            stiffness: 100,
        });
    };

    // Handle layout to get the switchContainer's width
    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setSwitchWidth(width);
    }

    // Handle swipe gesture to follow the user's finger
    const handleGestureEvent = (event: any) => {
        const { translationX } = event.nativeEvent;
        const buttonWidth = switchWidth / length

        const newPosition = (visibility + offset) * buttonWidth + translationX;
        if (newPosition >= buttonWidth && newPosition <= switchWidth - buttonWidth) {
            slidePosition.value = newPosition;
        }
    };

    // Handle the end of the gesture to snap the switch to the nearest button
    const handleGestureEnd = (event: any) => {
        const { translationX } = event.nativeEvent;
        const buttonWidth = switchWidth / length;

        const newActiveSwitch = Math.round(((visibility + offset) * buttonWidth + translationX) / buttonWidth) - 1;

        // Assurez-vous que l'index est dans la plage valide [0, 2]
        const validIndex = Math.max(0, Math.min(2, newActiveSwitch));
        handleSwitchChange(validIndex);
    };


    return (
        <PanGestureHandler onGestureEvent={handleGestureEvent} onEnded={handleGestureEnd}>
            <Animated.View style={styles.container} onLayout={handleLayout}>
                {props.label && (
                    <View style={styles.label}>
                        <Text style={styles.text}>{props.label}</Text>
                    </View>
                )}

                {/* Background section for the button at index 1 */}

                {props.label && Array.from({ length: 2 }).map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.backgroundSection,
                            {
                                width: switchWidth / length,
                                left: switchWidth / length,
                                backgroundColor: index === 1 ? THEME.colors.background.darker_x1 : "#f9f9f9",
                                zIndex: index === 1 ? -1 : 0,
                                borderTopLeftRadius: index === 1 ? 0 : 8,
                                borderBottomLeftRadius: index === 1 ? 0 : 8,
                            },
                        ]}
                    />
                ))}

                {/* Sliding indicator behind buttons */}
                <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />

                {/* Switch buttons */}
                {props.buttons.map((button, index) => (
                    <TouchableOpacity key={index} style={styles.button} onPress={() => handleSwitchChange(index)}>
                        <View style={styles.content}>
                            {React.cloneElement(button.class, {
                                name: button.name,
                                color: visibility === index ? button.iconColorSelected ? button.iconColorSelected : THEME.colors.text.white : button.iconColor ? button.iconColor : button.color,
                                size: button.size,
                                style: styles.icon,
                            })}
                            <Animated.Text style={[styles.text, { color: visibility === index ? button.textColorSelected ? button.textColorSelected : THEME.colors.text.white : button.textColor ? button.textColor : button.color }]}>{button.label}</Animated.Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        </PanGestureHandler>
    );
}

export default Switch;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        height: 40,
    },
    label: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.background.darker_x1,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
        color: 'grey',
    },
    icon: {
        marginRight: 4,
    },
    indicator: {
        position: 'absolute',
        height: '100%',
        backgroundColor: '#0088cc',
        borderRadius: 8,
        zIndex: 0,
    },
    button: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backgroundSection: {
        position: 'absolute',
        height: '100%',
    },
});