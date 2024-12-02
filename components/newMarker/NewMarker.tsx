import React, { useState, useEffect, useCallback } from 'react';
import { Animated, View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { THEME } from '~/constants/constants';
import { WindowType } from '~/contexts/window/types';
import { useMarker } from '~/contexts/marker/Context'
import { useWindow } from '~/contexts/window/Context';
import { MarkerType } from '~/contexts/marker/types';

const NewMarker = () => {
    const { state: markerState, updateNew: updateNewMarker } = useMarker()
    const {
        dotAnimation,
        closeAnimation,
        newMarkerButtons,
        enteringAnimation: enteringNewMarkerAnimation,
        exitingAnimation: exitingNewMarkerAnimation
    } = useMarker();
    const { setActive: setActiveWindow } = useWindow()
    const [columns, setColumns] = useState(2);

    useEffect(() => {
        const totalButtons = 4;
        setColumns(Math.ceil(Math.sqrt(totalButtons)));
    }, []);

    useEffect(() => {
        enteringNewMarkerAnimation();
    }, [markerState.new?.coordinates]);

    const handleButtonPress = useCallback(
        (type: MarkerType) => {

            if (markerState.new?.type === type) {
                updateNewMarker({ type: MarkerType.DEFAULT });
                setActiveWindow(WindowType.DEFAULT)
            } else {
                updateNewMarker({ type: type });
                setActiveWindow(WindowType.NEW_MARKER)
            }
        },
        [markerState.new, updateNewMarker]
    );

    return (
        <Marker
            coordinate={{
                latitude: markerState.new?.coordinates.lat || 0,
                longitude: markerState.new?.coordinates.long || 0,
            }}
        >
            <View style={[styles.container, { width: columns * 60 - 10 }]}>
                <Animated.View
                    style={[
                        styles.centerDot,
                        { opacity: dotAnimation, transform: [{ translateX: -4 }] },
                    ]}
                />
                {
                    newMarkerButtons.map(_ => {
                        return (
                            <Animated.View style={{ opacity: _.animation, transform: [{ scale: _.animation }] }} key={_.text.label}>
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        markerState.new?.type === MarkerType.CHAT && styles.activeBackground,
                                    ]}
                                    onPress={() => handleButtonPress(MarkerType.CHAT)}
                                >
                                    {React.cloneElement(_.icon.component, {
                                        name: _.icon.label,
                                        color: markerState.new?.type === MarkerType.CHAT ? _.icon.color.active : _.icon.color.default,
                                        size: _.icon.size,
                                        style: styles.buttonIcon,
                                    })}
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            markerState.new?.type === MarkerType.CHAT && styles.activeColor,
                                        ]}
                                    >
                                        Chat
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )
                    })
                }
                <Animated.View style={{ opacity: closeAnimation, transform: [{ scale: closeAnimation }] }}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => exitingNewMarkerAnimation(WindowType.DEFAULT)}
                    >
                        <FontAwesome name="times" size={15} style={styles.closeIcon} />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Marker>
    );
};

export default NewMarker;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        alignSelf: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    centerDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 5,
        backgroundColor: THEME.colors.primary,
        zIndex: 1,
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
        color: THEME.colors.primary,
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        padding: 3,
        backgroundColor: THEME.colors.grayscale.main,
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
    },
    buttonIconChannel: {
        alignSelf: 'center',
        marginBottom: 2,
        color: THEME.colors.primary,
    },
    buttonText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: THEME.colors.text.black,
        textAlign: 'center',
    },
    activeBackground: {
        backgroundColor: THEME.colors.primary,
    },
    activeColor: {
        color: THEME.colors.text.white,
    },
});
