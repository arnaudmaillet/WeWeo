import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Map from '../components/Map'
import chats from '../data/chats.json'
import ChatScreen from '~/components/Chat'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import SearchMenu from '~/components/SearchMenu'
import { useKeyboard } from '~/providers/KeyboardProvider'
import { useMap } from '~/providers/MapProvider'

import { PointProps } from '~/types/MapInterfaces'

const MainScreen = () => {
    const offset = useSharedValue(0);
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
    const { markers } = useMap();

    const fakeUserLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    }

    const [selectedPoint, setSelectedPoint] = useState<PointProps | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const keyboardHeight = useSharedValue(0);

    const { keyboardProps } = useKeyboard();

    const getChat = (id: number) => {
        return chats.data.find(chat => chat.id === id);
    }

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const translateSheetY = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: offset.value }],
        };
    })

    const translateSearchMenuY = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: withTiming(isMenuOpen ? -keyboardHeight.value : 0, { duration: 300 }) }], // Animation fluide avec withTiming
        };
    });

    const runOnJSSetSelectedPoint = (point: PointProps | null) => {
        setSelectedPoint(point);
    }

    const allPoints = markers;

    // Fonction pour aller au point suivant
    const goToNextPoint = () => {
        if (selectedPoint) {
            if (allPoints) {
                const currentIndex = allPoints.findIndex((point: PointProps) => point.id === selectedPoint.id);
                if (currentIndex !== undefined && currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % allPoints.length;  // Boucle au début après le dernier point
                    setSelectedPoint(allPoints[nextIndex]);
                }
            }
        }
    }

    // Fonction pour aller au point précédent
    const goToPreviousPoint = () => {
        if (selectedPoint) {
            const currentIndex = allPoints?.findIndex((point: PointProps) => point.id === selectedPoint.id);
            if (currentIndex !== undefined && currentIndex !== -1) {
                const previousIndex = (currentIndex - 1 + (allPoints?.length || 0)) % (allPoints?.length || 1);  // Boucle à la fin après le premier point
                if (allPoints) {
                    setSelectedPoint(allPoints[previousIndex]);
                }
            }
        }
    }

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            const isVerticalSwipe = Math.abs(event.translationY) > Math.abs(event.translationX);
            if (isVerticalSwipe) {
                // Gérer le swipe haut/bas
                const offsetDelta = event.translationY;  // Calculer le déplacement + offset
                const clamp = Math.max(-20, offsetDelta); // Limiter le déplacement vers le haut
                offset.value = offsetDelta > 0 ? offsetDelta : withSpring(clamp); // Appliquer le déplacement avec un rebond
            }
        })
        .onEnd((event) => {
            const isVerticalSwipe = Math.abs(event.translationY) > Math.abs(event.translationX);
            if (isVerticalSwipe) {
                if (offset.value < 520 / 3) {
                    offset.value = withSpring(0);
                } else {
                    offset.value = withTiming(1000, {}, (finished) => {
                        if (finished && selectedPoint) {
                            runOnJS(runOnJSSetSelectedPoint)(null);
                        }
                    });
                }
            } else {
                runOnJS(dismissKeyboard)();
                if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
                    if (event.translationX > 0) {
                        runOnJS(goToPreviousPoint)();  // Swipe right: go to previous point
                    } else {
                        runOnJS(goToNextPoint)();  // Swipe left: go to next point
                    }
                }
            }
        })

    useEffect(() => {
        offset.value = 0;
    }, [selectedPoint])

    useEffect(() => {
        offset.value = 0;
    }, [selectedPoint])


    useEffect(() => {
        if (isMenuOpen) {
            keyboardHeight.value = withTiming(keyboardProps.endCoordinates.height - 20, { duration: 0 });
        } else {
            keyboardHeight.value = withTiming(0, { duration: 0 });
        }
    }, [isMenuOpen])



    return (
        <View>
            {(() => {
                switch (selectedPoint?.type) {
                    case 1:
                        const chat = selectedPoint?.dataId !== undefined ? getChat(selectedPoint.dataId) : null;
                        return chat ? <>
                            <AnimatedPressable
                                style={styles.backdrop}
                                onPress={() => {
                                    setSelectedPoint(null);
                                    dismissKeyboard();
                                }}
                            />
                            <GestureDetector gesture={panGesture}>
                                <Animated.View style={[styles.sheet, translateSheetY]}>
                                    <KeyboardAvoidingView
                                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                        keyboardVerticalOffset={170}
                                        style={styles.keyboardAvoidingView}
                                    >
                                        <ChatScreen chat={chat} currentUserId={1} />
                                    </KeyboardAvoidingView>
                                </Animated.View>
                            </GestureDetector>
                        </> : <Text>No chat available</Text>;
                    default:
                        return <>
                            {
                                isMenuOpen && (
                                    <AnimatedPressable
                                        style={styles.backdrop}
                                        onPress={() => {
                                            setIsMenuOpen(false)
                                            dismissKeyboard()
                                        }}
                                    />
                                )
                            }
                            <Animated.View
                                style={[styles.searchMenu, translateSearchMenuY]}
                                entering={SlideInDown.springify().damping(17)}
                                exiting={SlideOutDown}
                            >
                                <KeyboardAvoidingView
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    keyboardVerticalOffset={380}
                                    style={styles.keyboardAvoidingView}
                                >
                                    <SearchMenu onBlurInput={() => setIsMenuOpen(false)} onFocusInput={() => { setIsMenuOpen(true) }} />
                                </KeyboardAvoidingView>
                            </Animated.View>
                        </>
                }
            })()}

            <Map
                userLocation={fakeUserLocation}
                selectedPoint={selectedPoint}
                setSelectedPoint={setSelectedPoint}
                chats={chats} />
        </View>
    )
}


export default MainScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    sheet: {
        position: "absolute",
        alignSelf: 'center',
        bottom: 20,
        zIndex: 1,
        width: 390,
        height: '80%',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 1,
    },
    searchMenu: {
        position: "absolute",
        alignSelf: 'center',
        bottom: 30,
        zIndex: 2,
        width: 390,
    }
})
