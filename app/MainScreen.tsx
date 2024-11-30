import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Map from '../components/Map'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import SearchMenu from '~/components/SearchMenu'
import { useKeyboard } from '~/contexts/KeyboardProvider'
import { useMap } from '~/contexts/MapProvider'
import { useWindow } from '~/contexts/window/Context'

import { IMarker } from '~/types/MarkerInterfaces'
import NewMarker from '~/components/NewMarker'
import { WindowType } from '~/contexts/window/types'
import { useNewMarker } from '~/contexts/NewMarkerProvider'

const _MAX_GESTURE_VERTICAL_OFFSET = -20

const MainScreen = () => {
    const offset = useSharedValue(0);
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
    const { marker, markers, newMarker, setMarker } = useMap();
    const { animateMarkersExiting } = useNewMarker()

    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
    const keyboardHeight = useSharedValue(0);

    const { keyboardProps } = useKeyboard();
    const { state, setActiveWindow } = useWindow()


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
            transform: [{ translateY: withTiming(isInputFocused ? -keyboardHeight.value : 0, { duration: 300 }) }], // Animation fluide avec withTiming
        };
    });

    const runOnJSSetSelectedMarker = (point: IMarker | null) => {
        setMarker(point);
        !point && setActiveWindow(WindowType.DEFAULT);
    }

    const pan = Gesture.Pan()
        .onChange((event) => {
            const Xcurrent = event.translationY;
            offset.value = Xcurrent > 0 ? Xcurrent : withSpring(Math.max(_MAX_GESTURE_VERTICAL_OFFSET, Xcurrent));
        })
        .onFinalize(() => {
            if (offset.value > 30) {
                offset.value = withSpring(0, {}, () => {
                    runOnJS(animateMarkersExiting)(WindowType.DEFAULT)
                })
            }
            offset.value = withSpring(0);
        });

    const customAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: offset.value }
        ]
    }))

    const allPoints = markers;

    // Fonction pour aller au point suivant
    const goToNextPoint = () => {
        if (marker) {
            if (allPoints) {
                const currentIndex = allPoints.findIndex((point: IMarker) => point.markerId === marker.markerId);
                if (currentIndex !== undefined && currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % allPoints.length;  // Boucle au début après le dernier point
                    setMarker(allPoints[nextIndex]);
                }
            }
        }
    }

    // Fonction pour aller au point précédent
    const goToPreviousPoint = () => {
        if (marker) {
            const currentIndex = allPoints?.findIndex((point: IMarker) => point.markerId === marker.markerId);
            if (currentIndex !== undefined && currentIndex !== -1) {
                const previousIndex = (currentIndex - 1 + (allPoints?.length || 0)) % (allPoints?.length || 1);  // Boucle à la fin après le premier point
                if (allPoints) {
                    setMarker(allPoints[previousIndex]);
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
                        if (finished && marker) {
                            runOnJS(runOnJSSetSelectedMarker)(null);
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
    }, [marker?.markerId])


    useEffect(() => {
        if (isInputFocused) {
            keyboardHeight.value = withTiming(keyboardProps.endCoordinates ? keyboardProps.endCoordinates.height - 20 : 0, { duration: 0 });
        } else {
            keyboardHeight.value = withTiming(0, { duration: 0 });
        }
    }, [isInputFocused])


    const renderWindow = () => {
        switch (state.activeWindow) {
            case WindowType.CHAT:
                return (
                    marker && (
                        <>
                            {/* <AnimatedPressable
                                style={styles.backdrop}
                                onPress={() => {
                                    dismissKeyboard();
                                    //setMarker(null);
                                    //setWindowToDisplay(WindowType.DEFAULT);
                                }}
                            />
                            <GestureDetector gesture={panGesture}>
                                <Animated.View style={[styles.sheet, translateSheetY]}>
                                    <KeyboardAvoidingView
                                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                        keyboardVerticalOffset={170}
                                        style={styles.keyboardAvoidingView}
                                    >
                                        <MarkerChat marker={marker} />
                                    </KeyboardAvoidingView>
                                </Animated.View>
                            </GestureDetector> */}
                        </>
                    )
                )
            case WindowType.NEW_MARKER:
                return (
                    <>
                        {isInputFocused && (
                            <AnimatedPressable
                                style={styles.backdrop}
                                onPress={() => {
                                    setIsInputFocused(false);
                                    dismissKeyboard();
                                }}
                            />
                        )}
                        <GestureDetector gesture={pan}>
                            <Animated.View
                                style={[styles.bottomSheet, customAnimatedStyle]}
                            >
                                <KeyboardAvoidingView
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    keyboardVerticalOffset={380}
                                    style={styles.keyboardAvoidingView}
                                >
                                    <NewMarker onBlurInput={() => setIsInputFocused(false)} onFocusInput={() => setIsInputFocused(true)} />
                                </KeyboardAvoidingView>
                            </Animated.View>
                        </GestureDetector>
                    </>
                )
            default:
                return (
                    <>
                        {isInputFocused && (
                            <AnimatedPressable
                                style={styles.backdrop}
                                onPress={() => {
                                    setIsInputFocused(false);
                                    dismissKeyboard();
                                }}
                            />
                        )}
                        <Animated.View
                            style={[styles.bottomSheet, translateSearchMenuY]}
                        >
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={380}
                                style={styles.keyboardAvoidingView}
                            >
                                <SearchMenu onBlurInput={() => setIsInputFocused(false)} onFocusInput={() => setIsInputFocused(true)} />
                            </KeyboardAvoidingView>
                        </Animated.View>
                    </>
                )
        }
    }


    return (
        <View>
            {renderWindow()}
            <Map />
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
    bottomSheet: {
        position: "absolute",
        alignSelf: 'center',
        bottom: 30,
        zIndex: 2,
        width: 390,
    }
})
