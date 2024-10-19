import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, ZoomIn } from 'react-native-reanimated'
import { PanGestureHandler } from 'react-native-gesture-handler';
import { FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'

interface SearchMenuProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}

const SearchMenu: React.FC<SearchMenuProps> = ({ onFocusInput, onBlurInput }) => {
    const [searchContent, setSearchContent] = React.useState<string>('')
    const [activeSwitch, setActiveSwitch] = React.useState<number>(1) // Default to the middle switch
    const [switchWidth, setSwitchWidth] = useState<number>(0)  // State to store the width of switchContainer

    const isTyping = searchContent !== '';

    // Animation shared value for the sliding effect
    const slidePosition = useSharedValue(0)

    useEffect(() => {
        // Set the initial position of the indicator for the middle button
        if (switchWidth > 0) {
            const buttonWidth = switchWidth / 3;
            slidePosition.value = withTiming(buttonWidth, { duration: 300 }); // Start with the middle button selected
        }
    }, [switchWidth]);

    // Update position when switch changes with less pronounced spring animation
    const handleSwitchChange = (index: number) => {
        setActiveSwitch(index)
        const buttonWidth = switchWidth / 3; // Calculate the width of each button
        slidePosition.value = withSpring(index * buttonWidth, {
            damping: 20,
            stiffness: 100,
        });
    }

    // Handle layout to get the switchContainer's width
    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setSwitchWidth(width);
    }

    // Handle swipe gesture to follow the user's finger
    const handleGestureEvent = (event: any) => {
        const { translationX } = event.nativeEvent;
        const buttonWidth = switchWidth / 3;

        // Update the slidePosition as the user swipes
        const newPosition = activeSwitch * buttonWidth + translationX;
        if (newPosition >= 0 && newPosition <= switchWidth - buttonWidth) {
            slidePosition.value = newPosition;
        }
    }

    // Handle the end of the gesture to snap the switch to the nearest button
    const handleGestureEnd = (event: any) => {
        const { translationX } = event.nativeEvent;
        const buttonWidth = switchWidth / 3;

        // Calculate the final position based on how far the user swiped
        const newActiveSwitch = Math.round((activeSwitch * buttonWidth + translationX) / buttonWidth);

        // Make sure the new index is within the valid range [0, 2]
        const validIndex = Math.max(0, Math.min(2, newActiveSwitch));
        handleSwitchChange(validIndex);
    }

    // Animated style for the sliding indicator
    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: slidePosition.value }],
            width: switchWidth / 3 // Make sure the indicator width matches the button width
        }
    })

    return (
        <View style={styles.container}>
            {/* Row with user icon and switch container */}
            <View style={styles.userIconContainer}>
                <Ionicons name="person-circle-outline" size={40} color="#007AFF" />
                <View style={styles.userStats}>
                    <MaterialCommunityIcons name="lightning-bolt" size={12} color="#007AFF" />
                    <Text style={{ fontSize: 12 }}>100</Text>
                </View>
            </View>
            <View style={styles.row}>
                {/* PanGestureHandler for swipe functionality */}
                <PanGestureHandler onGestureEvent={handleGestureEvent} onEnded={handleGestureEnd}>
                    <Animated.View
                        style={styles.switchContainer}
                        onLayout={handleLayout} // Capture the layout when the component is rendered
                    >
                        {/* Sliding indicator behind buttons */}
                        <Animated.View style={[styles.switchIndicator, animatedIndicatorStyle]} />

                        {/* Switch buttons */}
                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => handleSwitchChange(0)}
                        >
                            <View style={styles.switchContent}>
                                <Ionicons name="compass-outline" size={16} color={activeSwitch === 0 ? "white" : "#007AFF"} />
                                <Text style={activeSwitch === 0 ? styles.activeText : styles.inactiveText}>Discover</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => handleSwitchChange(1)}
                        >
                            <View style={styles.switchContent}>
                                <Ionicons name="flame-outline" size={16} color={activeSwitch === 1 ? "white" : "#007AFF"} />
                                <Text style={activeSwitch === 1 ? styles.activeText : styles.inactiveText}>Trending</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => handleSwitchChange(2)}
                        >
                            <View style={styles.switchContent}>
                                <Ionicons name="people-outline" size={16} color={activeSwitch === 2 ? "white" : "#007AFF"} />
                                <Text style={activeSwitch === 2 ? styles.activeText : styles.inactiveText}>Friends</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </PanGestureHandler>

                {/* Input field with search icon on the left */}
                <Animated.View style={styles.inputContainer}>
                    <Ionicons name="search-outline" size={20} color="#D3D3D3" style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Type to search..."
                        value={searchContent}
                        onChangeText={setSearchContent}
                        onFocus={onFocusInput}  // Appelle cette fonction lorsque l'input est focus
                        onBlur={onBlurInput}  // Appelle cette fonction lorsque l'input perd le focus
                    />
                    <TouchableOpacity onPress={() => { }} style={styles.sendButton}>
                        <Animated.View style={styles.animatedIcon} key={isTyping.toString()} entering={ZoomIn.springify()}>
                            {isTyping ? (
                                <MaterialIcons name="cancel" size={20} color="rgba(0, 0, 0, 0.25)" />
                            ) : (
                                <FontAwesome6 name="microphone" size={18} color='rgba(5, 126, 255, 0.25)' />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    )
}

export default SearchMenu

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 20,
        borderRadius: 20,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    row: {
        flex: 1, // This will take the rest of the space in the row
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    userIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15, // Space between the user icon and the switch/input
        flex: 0.2, // Take 10% of the space
        padding: 2,
    },
    userStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        height: 40, // Same height for consistency
    },
    switchButton: {
        flex: 1,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    switchContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 5,
    },
    inactiveText: {
        color: '#007AFF',
        fontWeight: '400',
        marginLeft: 5,
    },
    switchIndicator: {
        position: 'absolute',
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 8,
        zIndex: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        paddingHorizontal: 10,
        height: 40,
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 8,
    },
    animatedIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        padding: 4,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
