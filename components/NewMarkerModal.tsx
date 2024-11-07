import React, { useEffect, useState } from 'react';
import { Animated, View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { useMap } from '~/providers/MapProvider';
import { ChatTypes } from '~/types/MarkerInterfaces';
import { Fontisto, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface NewMarkerModalProps { }

const NewMarkerModal: React.FC<NewMarkerModalProps> = ({
}) => {
    const { newMarker, setNewMarker, newMarkerType, setNewMarkerType, addMarker } = useMap();
    const [newMarkerScaleX] = useState(new Animated.Value(0));

    useEffect(() => {
        if (newMarker) {
            newMarkerScaleX.setValue(0);
            Animated.spring(newMarkerScaleX, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }
    }, [newMarker]);

    const handleButtonPress = (type: ChatTypes) => {
        if (newMarkerType === type) {
            setNewMarkerType(null);
        } else {
            setNewMarkerType(type);
        }
    };

    const handleClosePress = () => {
        Animated.timing(newMarkerScaleX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setNewMarkerType(null);
            setNewMarker(null);
        });
    };

    return (
        <Marker coordinate={{ latitude: newMarker!.coordinates.lat, longitude: newMarker!.coordinates.long }}>
            <Animated.View style={[
                styles.markerContainer,
                {
                    transform: [
                        { scaleX: newMarkerScaleX },
                        { scaleY: newMarkerScaleX },
                    ],
                }
            ]}>
                <View style={styles.pillContainer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.leftButton,
                            newMarkerType === ChatTypes.Chat && styles.selectedButton,
                        ]}
                        onPress={() => handleButtonPress(ChatTypes.Chat)}
                    >
                        <Fontisto name="hipchat" size={10} color="white" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            newMarkerType === ChatTypes.Group && styles.selectedButton,
                        ]}
                        onPress={() => handleButtonPress(ChatTypes.Group)}
                    >
                        <FontAwesome6 name="people-group" size={10} color="white" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Group</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            newMarkerType === ChatTypes.Channel && styles.selectedButton,
                        ]}
                        onPress={() => handleButtonPress(ChatTypes.Channel)}
                    >
                        <FontAwesome name="comments-o" size={12} color="white" style={styles.buttonIconChannel} />
                        <Text style={styles.buttonText}>Channel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.closeButton, styles.rightButton]} onPress={handleClosePress}>
                        <FontAwesome name="times" size={12} color="white" style={styles.closeIcon} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Marker>
    );
};

export default NewMarkerModal;

const styles = StyleSheet.create({
    markerContainer: { alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
    pillContainer: {
        backgroundColor: 'transparent',
        padding: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    closeButton: {
        backgroundColor: '#FF7518',
        width: 20,
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
        borderRadius: 3,
        marginHorizontal: .5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    closeIcon: {
        alignSelf: 'center',
    },
    button: {
        padding: 3,
        backgroundColor: '#0088cc',
        marginHorizontal: .5,
        borderRadius: 3,
        height: 30,
        width: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    leftButton: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    rightButton: {
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    selectedButton: {
        backgroundColor: '#005b99',
    },
    buttonIcon: {
        alignSelf: 'center',
        marginBottom: 3,
    },
    buttonIconChannel: {
        alignSelf: 'center',
        marginBottom: 2,
    },
    buttonText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
});
