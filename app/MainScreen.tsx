import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Map from '../components/Map'
import MarkerChat from '~/components/MarkerChat'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import SearchMenu from '~/components/SearchMenu'
import { useKeyboard } from '~/providers/KeyboardProvider'
import { useMap } from '~/providers/MapProvider'

import { IMarker } from '~/types/MarkerInterfaces'
import NewMarker from '~/components/NewMarker'


const MainScreen = () => {
    const offset = useSharedValue(0);
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
    const { selectedMarker, markers, setSelectedMarker, newMarker, newMarkerType } = useMap();

    const fakeUserLocation = {
        lat: 37.7749,
        long: -122.4194,
        latDelta: 0.0922,
        longDelta: 0.0421,
    }

    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
    const keyboardHeight = useSharedValue(0);

    const { keyboardProps } = useKeyboard();


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
        setSelectedMarker(point);
    }

    const allPoints = markers;

    // Fonction pour aller au point suivant
    const goToNextPoint = () => {
        if (selectedMarker) {
            if (allPoints) {
                const currentIndex = allPoints.findIndex((point: IMarker) => point.markerId === selectedMarker.markerId);
                if (currentIndex !== undefined && currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % allPoints.length;  // Boucle au début après le dernier point
                    setSelectedMarker(allPoints[nextIndex]);
                }
            }
        }
    }

    // Fonction pour aller au point précédent
    const goToPreviousPoint = () => {
        if (selectedMarker) {
            const currentIndex = allPoints?.findIndex((point: IMarker) => point.markerId === selectedMarker.markerId);
            if (currentIndex !== undefined && currentIndex !== -1) {
                const previousIndex = (currentIndex - 1 + (allPoints?.length || 0)) % (allPoints?.length || 1);  // Boucle à la fin après le premier point
                if (allPoints) {
                    setSelectedMarker(allPoints[previousIndex]);
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
                        if (finished && selectedMarker) {
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
    }, [selectedMarker])


    useEffect(() => {
        if (isInputFocused) {
            keyboardHeight.value = withTiming(keyboardProps.endCoordinates ? keyboardProps.endCoordinates.height - 20 : 0, { duration: 0 });
        } else {
            keyboardHeight.value = withTiming(0, { duration: 0 });
        }
    }, [isInputFocused])



    return (
        <View>
            {/* {sheetToRender === SheetToRender.SEARCH_MENU && <>
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
            </>}
            {sheetToRender === SheetToRender.MARKER && selectedMarker && <>
                <AnimatedPressable
                    style={styles.backdrop}
                    onPress={() => {
                        setSelectedMarker(null);
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
                            <MarkerChat marker={selectedMarker} />
                        </KeyboardAvoidingView>
                    </Animated.View>
                </GestureDetector>
            </>}
            {sheetToRender === SheetToRender.NEW_MARKER && <>
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
                        <NewMarker onBlurInput={() => setIsInputFocused(false)} onFocusInput={() => setIsInputFocused(true)} />
                    </KeyboardAvoidingView>
                </Animated.View>
            </>} */}
            {selectedMarker ? (
                <>
                    <AnimatedPressable
                        style={styles.backdrop}
                        onPress={() => {
                            setSelectedMarker(null);
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
                                <MarkerChat marker={selectedMarker} />
                            </KeyboardAvoidingView>
                        </Animated.View>
                    </GestureDetector>
                </>
            ) : newMarkerType ? (<>
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
                        <NewMarker onBlurInput={() => setIsInputFocused(false)} onFocusInput={() => setIsInputFocused(true)} />
                    </KeyboardAvoidingView>
                </Animated.View>
            </>) : (
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
            )}
            <Map
                userLocation={fakeUserLocation}
                markers={markers && markers ? markers : []}
            />
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
