import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity, Keyboard, ActivityIndicator } from 'react-native'
import Animated, { BounceIn, FadeIn, FadeInRight, FadeOut, FadeOutUp, runOnJS, SlideInDown, SlideInLeft, SlideOutDown, StretchInY, ZoomIn, ZoomInEasyDown, ZoomOut, ZoomOutEasyDown } from 'react-native-reanimated'

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Message from '../Message';

import { THEME } from '~/constants/constants';
import { useMap } from '~/contexts/MapProvider';
import { useMarker } from '~/contexts/markers/Context';
import useNumberFormatter from '~/hooks/useNumberFormatter';
import { useAuth } from '~/contexts/AuthProvider';
import SettingsWrapper from './SettingsWrapper';

import { Image } from 'expo-image';
import StickersList from '../stickers/List';
import { useKeyboard } from '~/contexts/KeyboardProvider';

const ICON_BASE_SIZE = 38;

export interface IMarkerChatScreen { }

const MarkerChat: React.FC<IMarkerChatScreen> = () => {

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);

    const { user } = useAuth()
    const {
        state: markerState,
        isSubscribed,
        isChatBottomWindowShowed,
        setIsChatBottomWindowShowed,
        firestoreAddActiveMessage,
    } = useMarker()

    const { isKeyboardVisible } = useKeyboard()

    if (!markerState.active || !user) return null

    const { formatNumber } = useNumberFormatter();
    const { mapRef } = useMap()

    const [keyboardHeight, setKeyboardHeight] = useState(7);
    const [message, setMessage] = useState<string>('')
    const [showConnected, setShowConnected] = useState(true);
    const [showStickers, setShowStickers] = useState<boolean>(false)

    const isTyping = message !== '';

    const handleSendMessage = () => {
        if (message.length > 0) {
            firestoreAddActiveMessage(message)
            setMessage("")
        }
    }

    const handlePressSticker = () => {
        setShowStickers(!showStickers)
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);

        return () => clearTimeout(timeout);
    }, [showStickers, markerState.active.messages]);

    useEffect(() => {
        isKeyboardVisible && flatListRef.current?.scrollToEnd({ animated: true });
    }, [isKeyboardVisible])

    return (
        <Animated.View
            style={styles.messageSection}
            entering={StretchInY.springify().damping(17)}
            exiting={FadeOutUp.springify()}
        >
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <View style={styles.iconContainer}>
                        {markerState.active.icon ? (
                            <Image
                                source={{ uri: markerState.active.icon }}
                                style={styles.sticker}
                                contentFit="contain"
                            />
                        ) : (
                            <Image
                                source={{
                                    uri: 'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker1.gif',
                                }}
                                style={styles.sticker}
                                contentFit="contain"
                            />
                        )}
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>
                            {markerState.active.label.length > 0 ? markerState.active.label : 'test'}
                        </Text>
                    </View>
                    <View style={styles.settingsContainer}>
                        <SettingsWrapper />
                    </View>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                {
                    markerState.active && markerState.active.messages && <FlatList
                        ref={flatListRef}
                        data={markerState.active.messages}
                        renderItem={({ item, index }) => {
                            // Check if there is a previous message and if it is from the same sender
                            const previousMessage = index > 0 ? markerState.active!.messages[index - 1] : null;
                            const isSameUser = previousMessage && previousMessage.senderId === item.senderId;

                            return (
                                <Message
                                    key={item.messageId}
                                    item={item}
                                    previousMessage={isSameUser ? previousMessage : null}
                                />
                            );
                        }}
                        keyExtractor={(_, index) => index.toString()}
                        contentContainerStyle={[styles.messageList, { paddingBottom: keyboardHeight }]}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        getItemLayout={(_, index) => ({ length: 100, offset: 100 * index, index })}
                        showsVerticalScrollIndicator={false}
                    />
                }
            </View>
            <View style={styles.bottom}>
                <View style={styles.bottomWrapper}>
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
                                            markerState.active.connectedUserIds.length > 0 ?
                                                <Text style={styles.badgeText}>{markerState.active.connectedUserIds.length}</Text> :
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
                    showStickers && <View style={{ backgroundColor: THEME.colors.grayscale.darker_1x, height: 40, borderRadius: 10, overflow: 'hidden' }}>
                        <StickersList isHorizontal onClickItem={() => { }} dimensions={{ height: 40, width: 40 }} />
                    </View>
                }
            </View>
            <View style={styles.ellipsis}>
                <FontAwesome6 name="ellipsis" size={20} color={THEME.colors.grayscale.darker_3x} />
            </View>
        </Animated.View >
    )
}

const styles = StyleSheet.create({
    // Bandeau du haut avec les utilisateurs
    markerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        overflow: 'hidden',
        borderBottomWidth: 0.5,
        borderColor: THEME.colors.grayscale.darker_1x,
        backgroundColor: THEME.colors.grayscale.darker_1x,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    // Conteneur pour l'empilement d'icônes d'utilisateurs
    userStackContainer: {
        flex: 6,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        width: '100%',
    },
    userStack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        maxWidth: '80%',
    },

    // Icônes empilées des utilisateurs
    userStackIconContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: THEME.colors.grayscale.main,
        borderWidth: .5,
        borderColor: 'gray',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: ICON_BASE_SIZE,
        paddingHorizontal: 2,
        maxHeight: '100%',
        maxWidth: '100%',
    },
    userStackIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        height: ICON_BASE_SIZE,
    },
    // Icône d'utilisateur
    userIconContainer: {
        backgroundColor: THEME.colors.primary,
        borderRadius: 20,
        width: '90%',
        height: '90%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Texte à l'intérieur de l'avatar
    userAvatarText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
    },
    // Badge pour le nombre d'utilisateurs
    userCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        marginLeft: 10,
        zIndex: 1,
    },
    // Texte du nombre d'utilisateurs
    userCountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'gray',
        marginRight: 5,
    },
    // Bouton d'abonnement
    subscribeContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 3,
    },
    subscribeIcon: {
        padding: 7,
        borderRadius: 20,
    },
    subscribeButton: {
        color: 'gray',
        textAlign: 'left',
    },
    // Section des messages
    messageSection: {
        flex: 1,
        width: '100%',
        backgroundColor: THEME.colors.grayscale.main,
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.15)',
        borderWidth: 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    // Liste des messages
    messageList: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    // Bouton pour fermer les stickers
    closeStickerButton: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 10,
        zIndex: 1,
    },
    // Section d'entrée du message et des stickers
    inputSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    bottom: {
        marginHorizontal: 10,
        borderTopWidth: 1,
        borderColor: THEME.colors.grayscale.darker_1x,
        marginBottom: 15,
        gap: 10
    },
    bottomWrapper: {
        gap: 10,
        flexDirection: 'row',
    },
    settingsWrapper: {
        flexDirection: 'row',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 5,
        gap: 5,
        marginTop: 10,
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
    // Conteneur des stickers
    stickerSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.15)',
        borderWidth: 1,
        overflow: 'hidden',
    },
    // Wrapper pour les icônes dans les boutons
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ellipsis: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -3,
        left: '50%',
        transform: [{ translateX: -25 }],
        width: 50
    },
    sticker: {
        height: 40,
        width: 40,
        alignSelf: 'center',
        flex: 1,
    },
    container: {
        height: 65,
        paddingVertical: 8,
        marginHorizontal: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: THEME.colors.grayscale.darker_1x,
    },
    innerContainer: {
        flex: 1,
        flexDirection: 'row',
        overflow: 'hidden',
        borderRadius: 10,
        backgroundColor: THEME.colors.grayscale.darker_1x,
    },
    iconContainer: {
        width: 50,
        backgroundColor: THEME.colors.grayscale.darker_2x,
    },
    labelContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    label: {
        color: 'gray',
    },
    settingsContainer: {
        width: 65,
        justifyContent: 'center',
        alignItems: 'center',
    },
});



export default MarkerChat;
