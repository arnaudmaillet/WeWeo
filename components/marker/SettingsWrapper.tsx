import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { ZoomIn, ZoomOut, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { THEME } from '~/constants/constants';
import { useMarker } from '~/contexts/markers/Context';
import { useAuth } from '~/contexts/AuthProvider';

interface SettingsWrapperProps { }

const SettingsWrapper: React.FC<SettingsWrapperProps> = () => {
    const { user } = useAuth();
    const { state: markerState, isSubscribed, firestoreManageActiveSubscription } = useMarker();

    // Contrôle de la visibilité pour chaque bouton
    const [showSettings, setShowSettings] = useState(true);
    const [showBookmark, setShowBookmark] = useState(true);
    const [showNotifications, setShowNotifications] = useState(true);
    const [showConnected, setShowConnected] = useState(true);

    if (!markerState.active || !user) return null;

    const isCreator = markerState.active.creatorId === user.userId;
    const offsetX = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isSubscribed) {
            offsetX.value = 20
            opacity.value = 1
        } else {
            offsetX.value = 0
            opacity.value = 0
        }
    }, [isSubscribed])

    const hideAnimation = useAnimatedStyle(() => {
        return {
            width: withSpring(offsetX.value, { damping: 100 }),
            opacity: withSpring(opacity.value),
        };
    })

    return (
        <View style={styles.container}>
            {showSettings && isCreator && (
                <Animated.View
                    entering={ZoomIn.springify()}
                    exiting={ZoomOut.springify().withCallback(() => runOnJS(setShowSettings)(!showSettings))}
                >
                    <TouchableOpacity>
                        <MaterialIcons name="settings" size={22} color={THEME.colors.grayscale.darker_3x} />
                    </TouchableOpacity>
                </Animated.View>
            )}
            {showBookmark && !isCreator && (

                <Animated.View
                    entering={ZoomIn.springify()}
                    exiting={ZoomOut.springify().withCallback(() => runOnJS(setShowBookmark)(!showBookmark))}
                >
                    <TouchableOpacity onPress={firestoreManageActiveSubscription}>
                        {isSubscribed ? (
                            <MaterialIcons name="bookmark" size={22} color={THEME.colors.primary} />
                        ) : (
                            <MaterialCommunityIcons name="bookmark-outline" size={22} color={THEME.colors.grayscale.darker_3x} />
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}

            <Animated.View style={[hideAnimation, { height: 20 }]}>
                {showNotifications && (isCreator || isSubscribed) && (
                    <Animated.View
                        entering={ZoomIn.springify().damping(100)}
                        exiting={ZoomOut}
                    >
                        <TouchableOpacity>
                            <Ionicons name="notifications" size={20} color={THEME.colors.grayscale.darker_3x} />
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </Animated.View>
            {showConnected && (
                <Animated.View
                    entering={ZoomIn.springify()}
                    exiting={ZoomOut.springify().withCallback(() => runOnJS(setShowConnected)(!showConnected))}
                >
                    <TouchableOpacity>
                        <View style={styles.connectedWrapper}>
                            <Ionicons name="people-circle-outline" size={24} color={THEME.colors.grayscale.darker_3x} />
                            <View style={styles.badgeContainer}>
                                {
                                    markerState.active.connectedUserIds.length > 0 ?
                                        <Text style={styles.badgeText}>{markerState.active.connectedUserIds.length}</Text> :
                                        <ActivityIndicator size="small" color={THEME.colors.grayscale.lighter_2x} style={{ position: 'absolute', transform: [{ scale: 0.6 }] }} />
                                }
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 5,
        gap: 5,
        marginTop: 5,
        marginBottom: 15,
    },
    connectedWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#FF4C4C',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 1,
    },
    badgeText: {
        color: 'white',
        fontSize: 6,
        fontWeight: 'bold',
    },
});

export default SettingsWrapper;
