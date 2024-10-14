import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Map from '../components/Map'
import chats from '../data/chats.json'
import ChatScreen from '~/components/Chat'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

interface IPoint {
    id: number;
    latitude: number;
    longitude: number;
    type: number;
    dataId: number;
    minZoom: number;
}

interface ICoordinates {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

const HomeScreen = () => {

    const offset = useSharedValue(0);
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    const fakeUserLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    }

    const [selectedPoint, setSelectedPoint] = useState<IPoint | null>(null);

    const [flyTo, setFlyTo] = useState<ICoordinates>(fakeUserLocation);

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

    useEffect(() => {
        if (selectedPoint) {
            // Si un point est sélectionné, déplacer la caméra vers ce point
            setFlyTo({
                latitude: selectedPoint.latitude,
                longitude: selectedPoint.longitude,
                latitudeDelta: 0.005,  // Ajustez selon vos besoins
                longitudeDelta: 0.005, // Ajustez selon vos besoins
            });
        }
    }, [selectedPoint]);

    return (
        <View>
            {(() => {
                switch (selectedPoint?.type) {
                    case 1:
                        const chat = getChat(selectedPoint?.dataId);
                        return chat ? <>
                            <AnimatedPressable
                                style={styles.backdrop}
                                onPress={() => {
                                    setSelectedPoint(null)
                                    dismissKeyboard()
                                }}
                            />
                            <Animated.View
                                style={[styles.sheet, translateSheetY]}
                            >
                                <KeyboardAvoidingView
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    keyboardVerticalOffset={160}
                                    style={styles.keyboardAvoidingView}
                                >
                                    <ChatScreen chat={chat} currentUserId={1} />
                                </KeyboardAvoidingView>
                            </Animated.View>
                        </>
                            : <Text>No chat available</Text>;
                    default:
                        return (
                            <></>
                        );
                }
            })()}
            <Map
                userLocation={fakeUserLocation}
                selectedPoint={selectedPoint}
                setSelectedPoint={setSelectedPoint}
                flyTo={flyTo}  // Passer les nouvelles coordonnées ici
                setFlyTo={setFlyTo}
            />
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
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
        bottom: 20,
        zIndex: 2,
        width: 390,
    }
})
