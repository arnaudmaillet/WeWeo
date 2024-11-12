import React, { useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { Animated, View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { useMap } from '~/providers/MapProvider';
import { ChatTypes } from '~/types/MarkerInterfaces';
import { Fontisto, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { THEME } from '~/constants/constants';

interface NewMarkerModalProps {
}

const NewMarkerModal = forwardRef((_: NewMarkerModalProps, ref) => {
    const { newMarker, setNewMarker, newMarkerType, setNewMarkerType, addMarker } = useMap();
    const [columns, setColumns] = useState(2);

    const [dotAnimation] = useState(new Animated.Value(0));
    const [chatAnimation] = useState(new Animated.Value(0));
    const [groupAnimation] = useState(new Animated.Value(0));
    const [channelAnimation] = useState(new Animated.Value(0));
    const [closeAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        const totalButtons = 4;
        setColumns(Math.ceil(Math.sqrt(totalButtons)));
    }, []);

    useEffect(() => {
        if (newMarker) {
            dotAnimation.setValue(0);
            chatAnimation.setValue(0);
            groupAnimation.setValue(0);
            channelAnimation.setValue(0);
            closeAnimation.setValue(0);
        }
        animateMarkersEntering();
    }, [newMarker?.markerId]);

    useImperativeHandle(ref, () => ({
        animateMarkersExiting,
    }));

    const animateMarkersEntering = async () => {
        if (newMarker) {
            Animated.stagger(50, [
                Animated.spring(dotAnimation, { toValue: 1, useNativeDriver: true }),
                Animated.spring(chatAnimation, { toValue: 1, useNativeDriver: true }),
                Animated.spring(groupAnimation, { toValue: 1, useNativeDriver: true }),
                Animated.spring(channelAnimation, { toValue: 1, useNativeDriver: true }),
                Animated.spring(closeAnimation, { toValue: 1, useNativeDriver: true })
            ]).start();
        }
    };

    const animateMarkersExiting = async () => {
        setNewMarkerType(null);
        Animated.stagger(50, [
            Animated.spring(dotAnimation, { toValue: 0, useNativeDriver: true }),
            Animated.spring(chatAnimation, { toValue: 0, useNativeDriver: true }),
            Animated.spring(groupAnimation, { toValue: 0, useNativeDriver: true }),
            Animated.spring(channelAnimation, { toValue: 0, useNativeDriver: true }),
            Animated.spring(closeAnimation, { toValue: 0, useNativeDriver: true })
        ]).start(() => {
            setNewMarker(null);
        });
    }

    const handleButtonPress = (type: ChatTypes) => {
        if (newMarkerType === type) {
            setNewMarkerType(null);
        } else {
            setNewMarkerType(type);
        }
    };

    return (
        <Marker coordinate={{ latitude: newMarker!.coordinates.lat, longitude: newMarker!.coordinates.long }}>
            <View style={[styles.container, { width: columns * 60 - 10 }]}>
                <Animated.View style={[styles.centerDot, { opacity: dotAnimation, transform: [{ translateX: -6 }] }]} />
                <Animated.View style={{ opacity: chatAnimation, transform: [{ scale: chatAnimation }] }}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            newMarkerType === ChatTypes.Chat && styles.selectedBackground,
                        ]}
                        onPress={() => handleButtonPress(ChatTypes.Chat)}
                    >
                        <Fontisto name="hipchat" size={10} style={[
                            styles.buttonIcon,
                            newMarkerType === ChatTypes.Chat && styles.selectedColor,
                        ]} />
                        <Text style={[styles.buttonText, newMarkerType === ChatTypes.Chat && styles.selectedColor]}>Chat</Text>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ opacity: closeAnimation, transform: [{ scale: closeAnimation }] }}>
                    <TouchableOpacity style={[styles.closeButton]} onPress={animateMarkersExiting}>
                        <FontAwesome name="times" size={15} style={styles.closeIcon} />
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ opacity: groupAnimation, transform: [{ scale: groupAnimation }] }}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            newMarkerType === ChatTypes.Group && styles.selectedBackground,
                        ]}
                        onPress={() => handleButtonPress(ChatTypes.Group)}
                    >
                        <FontAwesome6 name="people-group" size={10} style={[styles.buttonIcon, newMarkerType === ChatTypes.Group && styles.selectedColor]} />
                        <Text style={[styles.buttonText, newMarkerType === ChatTypes.Group && styles.selectedColor]}>Group</Text>
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ opacity: channelAnimation, transform: [{ scale: channelAnimation }] }}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            newMarkerType === ChatTypes.Channel && styles.selectedBackground,
                        ]}
                        onPress={() => handleButtonPress(ChatTypes.Channel)}
                    >
                        <FontAwesome name="comments-o" size={12} style={[styles.buttonIconChannel, newMarkerType === ChatTypes.Channel && styles.selectedColor]} />
                        <Text style={[styles.buttonText, newMarkerType === ChatTypes.Channel && styles.selectedColor]}>Channel</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Marker>
    );
});

export default NewMarkerModal;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        alignSelf: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        zIndex: 10
    },
    centerDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 5,
        backgroundColor: THEME.colors.accent,
        zIndex: 1, // S'assure que le point rouge est au-dessus des boutons
        left: '50%',
        borderColor: THEME.colors.text.black,
    },
    closeButton: {
        display: 'flex',
        justifyContent: 'center',
        padding: 3,
        backgroundColor: THEME.colors.accent,
        width: 50,
        alignItems: 'center',
        height: 40,
        borderRadius: 10,
        borderBottomLeftRadius: 3,
        borderColor: THEME.colors.text.black,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    closeIcon: {
        alignSelf: 'center',
        color: THEME.colors.primary
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        padding: 3,
        backgroundColor: THEME.colors.background.main,
        marginVertical: 5,
        borderRadius: 10,
        height: 40,
        width: 50,
        shadowColor: THEME.colors.text.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonIcon: {
        alignSelf: 'center',
        marginBottom: 3,
        color: THEME.colors.primary
    },
    buttonIconChannel: {
        alignSelf: 'center',
        marginBottom: 2,
        color: THEME.colors.primary
    },
    buttonText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: THEME.colors.text.black,
        textAlign: 'center',
    },
    selectedBackground: {
        backgroundColor: THEME.colors.primary,
    },
    selectedColor: {
        color: THEME.colors.text.white,
    },
});