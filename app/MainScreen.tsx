import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Map from '../components/Map'
import ChatMarker from '~/components/ChatMarker'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import SearchMenu from '~/components/SearchMenu'
import { useKeyboard } from '~/providers/KeyboardProvider'
import { useMap } from '~/providers/MapProvider'

import { IMarker } from '~/types/MarkerInterfaces'

const MainScreen = () => {
    const offset = useSharedValue(0);
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
    const { markers } = useMap();

    const fakeUserLocation = {
        lat: 37.7749,
        long: -122.4194,
        latDelta: 0.0922,
        longDelta: 0.0421,
    }

    const [selectedMarker, setSelectedMarker] = useState<IMarker | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
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
            transform: [{ translateY: withTiming(isMenuOpen ? -keyboardHeight.value : 0, { duration: 300 }) }], // Animation fluide avec withTiming
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
                const currentIndex = allPoints.findIndex((point: IMarker) => point.id === selectedMarker.id);
                if (currentIndex !== undefined && currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % allPoints.length;  // Boucle au début après le dernier point
                    setSelectedMarker(allPoints[nextIndex]);
                    console.log("Next point: ", selectedMarker);
                }
            }
        }
    }

    // Fonction pour aller au point précédent
    const goToPreviousPoint = () => {
        if (selectedMarker) {
            const currentIndex = allPoints?.findIndex((point: IMarker) => point.id === selectedMarker.id);
            if (currentIndex !== undefined && currentIndex !== -1) {
                const previousIndex = (currentIndex - 1 + (allPoints?.length || 0)) % (allPoints?.length || 1);  // Boucle à la fin après le premier point
                if (allPoints) {
                    setSelectedMarker(allPoints[previousIndex]);
                    console.log("Previous point: ", selectedMarker);
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
        offset.value = 0;
    }, [selectedMarker])


    useEffect(() => {
        if (isMenuOpen) {
            keyboardHeight.value = withTiming(keyboardProps.endCoordinates.height - 20, { duration: 0 });
        } else {
            keyboardHeight.value = withTiming(0, { duration: 0 });
        }
    }, [isMenuOpen])



    return (
        <View>
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
                                <ChatMarker marker={selectedMarker} currentUserId={"1"} />
                            </KeyboardAvoidingView>
                        </Animated.View>
                    </GestureDetector>
                </>
            ) : (
                <>
                    {isMenuOpen && (
                        <AnimatedPressable
                            style={styles.backdrop}
                            onPress={() => {
                                setIsMenuOpen(false);
                                dismissKeyboard();
                            }}
                        />
                    )}
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
                            <SearchMenu onBlurInput={() => setIsMenuOpen(false)} onFocusInput={() => setIsMenuOpen(true)} />
                        </KeyboardAvoidingView>
                    </Animated.View>
                </>
            )}

            <Map
                userLocation={fakeUserLocation}
                selectedMarker={selectedMarker}
                setSelectedMarker={setSelectedMarker}
                markers={markers && markers ? markers : []} />
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
