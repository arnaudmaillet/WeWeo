import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Map from '../components/Map'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import SearchMenuWindow from '~/windows/SearchMenu'
import { useKeyboard } from '~/contexts/KeyboardProvider'
import { useWindow } from '~/contexts/windows/Context'

import NewMarkerWindow from '~/windows/NewMarker'
import { WindowType } from '~/contexts/windows/types'
import { useMarker } from '~/contexts/markers/Context'
import MarkerChat from '~/components/MarkerChat'
import { IMarker } from '~/contexts/markers/types'


const _MAX_GESTURE_VERTICAL_OFFSET = 20

const MainScreen = () => {
    const offset = useSharedValue(0);
    const insets = useSafeAreaInsets();
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
    const keyboardHeight = useSharedValue(0);

    const { keyboardProps } = useKeyboard();
    const { state: windowState, setActive: setActiveWindow } = useWindow()
    const { state: markerState, setActive: setActiveMarker, exitingAnimation: exitingNewMarkerAnimation, } = useMarker()

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const translateSheetY = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: offset.value }]
        };
    })

    const translateSearchMenuY = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: withTiming(isInputFocused ? -keyboardHeight.value : 0, { duration: 300 }) }], // Animation fluide avec withTiming
        };
    });

    const runOnJSSetSelectedMarker = (point: IMarker | null) => {
        setActiveMarker(point);
        !point && setActiveWindow(WindowType.DEFAULT);
    }

    const pan = Gesture.Pan()
        .onChange((event) => {
            const currentY = event.translationY;
            offset.value = currentY > 0 ? currentY : withSpring(Math.max(-(_MAX_GESTURE_VERTICAL_OFFSET), currentY));
        })
        .onFinalize(() => {
            if (offset.value > 30) {
                offset.value = withSpring(0, {}, () => {
                    runOnJS(exitingNewMarkerAnimation)(WindowType.DEFAULT)
                })
            }
            offset.value = withSpring(0);
        });


    const customAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: offset.value }
        ]
    }))

    const allPoints = markerState.list;

    // Fonction pour aller au point suivant
    const goToNextPoint = () => {
        if (markerState.active) {
            if (allPoints) {
                const currentIndex = allPoints.findIndex((point: IMarker) => point.markerId === markerState.active?.markerId);
                if (currentIndex !== undefined && currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % allPoints.length;  // Boucle au début après le dernier point
                    setActiveMarker(allPoints[nextIndex]);
                }
            }
        }
    }

    // Fonction pour aller au point précédent
    const goToPreviousPoint = () => {
        if (markerState.active) {
            const currentIndex = allPoints?.findIndex((point: IMarker) => point.markerId === markerState.active?.markerId);
            if (currentIndex !== undefined && currentIndex !== -1) {
                const previousIndex = (currentIndex - 1 + (allPoints?.length || 0)) % (allPoints?.length || 1);  // Boucle à la fin après le premier point
                if (allPoints) {
                    setActiveMarker(allPoints[previousIndex]);
                }
            }
        }
    }

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            const isVerticalSwipe = Math.abs(event.translationY) > Math.abs(event.translationX);
            if (isVerticalSwipe) {
                // Gérer le swipe haut/bas
                const offsetDelta = event.translationY; // Calculer le déplacement
                const clamp = Math.min(20, offsetDelta); // Limiter le déplacement vers le bas
                offset.value = offsetDelta < 0 ? offsetDelta : withSpring(clamp); // Appliquer le déplacement avec un rebond
            }
        })
        .onEnd((event) => {
            const isVerticalSwipe = Math.abs(event.translationY) > Math.abs(event.translationX);
            if (isVerticalSwipe) {
                if (offset.value > -520 / 3) {
                    // Si le swipe vers le haut n'est pas suffisant, revenir à 0
                    offset.value = withSpring(0);
                } else {
                    // Si le swipe vers le haut est suffisant, fermer le marqueur
                    offset.value = withTiming(-1000, {}, (finished) => {
                        if (finished && markerState.active) {
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
        offset.value = 0
    }, [markerState.active?.markerId])


    useEffect(() => {
        if (isInputFocused) {
            keyboardHeight.value = withTiming(keyboardProps.endCoordinates ? keyboardProps.endCoordinates.height - 20 : 0, { duration: 0 });
        } else {
            keyboardHeight.value = withTiming(0, { duration: 0 });
        }
    }, [isInputFocused])


    const renderWindow = () => {
        switch (windowState.active) {
            case WindowType.CHAT:
                return (
                    markerState.active && (
                        <>
                            {/* <AnimatedPressable
                                style={styles.backdrop}
                                onPress={() => {
                                    dismissKeyboard();
                                    //setMarker(null);
                                    //setWindowToDisplay(WindowType.DEFAULT);
                                }}
                            /> */}
                            <GestureDetector gesture={panGesture}>
                                <Animated.View style={[translateSheetY, styles.sheet, { top: insets.top }]}>
                                    <KeyboardAvoidingView
                                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                        keyboardVerticalOffset={65}
                                        style={styles.keyboardAvoidingView}
                                    >
                                        <MarkerChat />
                                    </KeyboardAvoidingView>
                                </Animated.View>
                            </GestureDetector>
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
                                style={[styles.bottomSheet, customAnimatedStyle, { bottom: insets.bottom }]}
                            >
                                <KeyboardAvoidingView
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    keyboardVerticalOffset={380}
                                    style={styles.keyboardAvoidingView}
                                >
                                    <NewMarkerWindow />
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
                            style={[styles.bottomSheet, translateSearchMenuY, { bottom: insets.bottom }]}
                        >
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={380}
                                style={styles.keyboardAvoidingView}
                            >
                                <SearchMenuWindow onBlurInput={() => setIsInputFocused(false)} onFocusInput={() => setIsInputFocused(true)} />
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
        zIndex: 1,
        width: '94%',
        maxWidth: 800,
        height: '70%'
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 1,
    },
    bottomSheet: {
        position: "absolute",
        alignSelf: 'center',
        zIndex: 2,
        width: '94%',
        maxWidth: 800,
    }
})
