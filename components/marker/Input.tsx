import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Animated, { runOnJS, ZoomIn, ZoomOut } from 'react-native-reanimated'
import { THEME } from '~/constants/constants'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import StickersList from '../stickers/List'
import { useMarker } from '~/contexts/markers/Context'
import { useKeyboard } from '~/contexts/KeyboardProvider'
import { INewMessage } from '~/contexts/markers/types'
import { FirestoreAction } from '~/types/FirestoreAction'
import { useAuth } from '~/contexts/AuthProvider'
import useNumberFormatter from '~/hooks/useNumberFormatter'

interface IMarkerInput {
    showStickers: boolean,
    setShowStickers: React.Dispatch<React.SetStateAction<boolean>>
}

const MarkerInput: React.FC<IMarkerInput> = ({ showStickers, setShowStickers }) => {
    const { user } = useAuth()
    if (!user) return
    const { state: markerState, firestoreManageActiveMessages } = useMarker()
    const { isKeyboardVisible } = useKeyboard()
    const { formatNumber } = useNumberFormatter();

    const inputRef = useRef<TextInput>(null);

    const [showConnected, setShowConnected] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('')

    const isTyping = message !== '';

    if (!markerState.active) return null

    const handleSendMessage = () => {
        if (message.length > 0) {
            firestoreManageActiveMessages(FirestoreAction.ADD, {
                content: message,
                senderId: user.userId,
                type: 'message',
                createdAt: new Date().getTime(),
            } as INewMessage)
            setMessage("")
        }
    }

    const handlePressSticker = () => {
        setShowStickers(!showStickers)
    }

    return (
        <View style={styles.container}>
            <View style={styles.containerWrapper}>
                {showConnected && (
                    <Animated.View
                        entering={ZoomIn.springify()}
                        exiting={ZoomOut.springify().withCallback(() => runOnJS(setShowConnected)(!showConnected))}
                        style={{ justifyContent: 'center', marginTop: 10 }}
                    >
                        <TouchableOpacity>
                            <View style={styles.connectedWrapper}>
                                <Ionicons name="people-circle-outline" size={24} color={THEME.colors.grayscale.darker_3x} />
                                <View style={styles.badgeContainer}>

                                    {
                                        markerState.active.connections && markerState.active.connections.length > 0 ?
                                            <Text style={styles.badgeText}>{formatNumber(markerState.active.connections.length)}</Text> :
                                            <ActivityIndicator size="small" color={THEME.colors.grayscale.lighter_2x} style={{ position: 'absolute', transform: [{ scale: 0.6 }] }} />
                                    }
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}
                <View style={styles.messageInputWrapper}>
                    <TextInput
                        ref={inputRef}
                        style={styles.messageInput}
                        placeholder="Message"
                        value={message}
                        onChangeText={setMessage}
                    />
                    <Animated.View
                        style={styles.toggleStickerButton}
                        key={isKeyboardVisible.toString()}
                        entering={ZoomIn.springify().damping(17)}
                        exiting={ZoomOut.springify().damping(17).duration(500)}
                    >
                        <TouchableOpacity onPress={handlePressSticker}>
                            {!isKeyboardVisible && (
                                <MaterialCommunityIcons name="sticker-emoji" size={23} color={THEME.colors.grayscale.darker_3x} />
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity onPress={handleSendMessage} style={styles.sendMessageButton}>
                        <Animated.View style={styles.iconWrapper} key={isTyping.toString()} entering={ZoomIn.springify().damping(17).delay(100)}>
                            {
                                // isLoading ? (
                                //     <ActivityIndicator size="small" color="#0088cc" />
                                // ) : (
                                isTyping ? (
                                    <View style={styles.sendIcon}>
                                        <Ionicons name="send" size={12} color={THEME.colors.grayscale.lighter_2x} />
                                    </View>
                                ) : (
                                    <FontAwesome6 name="microphone" size={18} color={THEME.colors.grayscale.darker_3x} />
                                )
                                // )
                            }
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </View>
            {
                showStickers && <View style={{ height: 40, borderRadius: 10, overflow: 'hidden' }}>
                    <StickersList isHorizontal onClickItem={() => { }} dimensions={{ height: 40, width: 40 }} />
                </View>
            }
        </View>
    )
}

export default MarkerInput

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10,
        borderTopWidth: 1,
        borderColor: THEME.colors.grayscale.darker_1x,
        marginBottom: 15,
        gap: 10
    },
    containerWrapper: {
        gap: 10,
        flexDirection: 'row',
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
        paddingHorizontal: 1
    },
    badgeText: {
        color: 'white',
        fontSize: 6,
        fontWeight: 'bold',
    },
    // Conteneur d'entrée de message
    messageInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.darker_1x,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginTop: 10,
        height: 40,
    },
    // Zone d'entrée de texte
    messageInput: {
        flex: 1,
        backgroundColor: THEME.colors.grayscale.darker_1x,
    },
    // Bouton pour afficher les stickers
    toggleStickerButton: {
        padding: 2,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Bouton pour envoyer un message
    sendMessageButton: {
        padding: 2,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Icône d'envoi
    sendIcon: {
        borderRadius: 15,
        width: 23,
        height: 23,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.colors.primary,
    },
    // Wrapper pour les icônes dans les boutons
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})