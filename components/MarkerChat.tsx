import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity, Keyboard, ActivityIndicator } from 'react-native'
import Animated, { BounceIn, FadeIn, FadeInRight, FadeOut, SlideInDown, SlideInLeft, SlideOutDown, StretchInY, ZoomIn, ZoomInEasyDown, ZoomOut, ZoomOutEasyDown } from 'react-native-reanimated'

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { IMarkerChatScreen, IMessage } from '~/types/MarkerInterfaces';

import Stickers from './Stickers';
import Message from './Message';

import { useMarker } from '~/contexts/MarkerProvider';
import { THEME } from '~/constants/constants';
import { MaterialIcons } from '@expo/vector-icons';
import { useMap } from '~/contexts/MapProvider';


const MAX_ICONS_PER_ROW = 5;
const ICON_BASE_SIZE = 38;


const MarkerChat: React.FC<IMarkerChatScreen> = ({ marker }) => {

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);

    const { isLoading, message, messages, participants, setMessage, setMessages, setParticipants, sendMessage, subscribe, isSubscribed } = useMarker();
    const { mapRef } = useMap()

    const [showStickers, setShowStickers] = useState<boolean>(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(7);

    const isTyping = message !== '';

    useEffect(() => {
        setMessages([])
        setParticipants([])
        if (marker.label === '') {
            inputRef.current?.focus()
        }
    }, [marker.markerId])

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', (e: any) => {
            setKeyboardHeight(6.9999); // Récupère la hauteur du clavier
            setKeyboardVisible(true);
            flatListRef.current?.scrollToEnd({ animated: true });
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardVisible(false);
            setKeyboardHeight(7);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [messages]);

    const combineMessages = (messages: IMessage[]) => {
        return messages.reduce((acc: IMessage[], curr: IMessage) => {
            const lastMessage: IMessage = acc[acc.length - 1];
            if (lastMessage && lastMessage.senderId === curr.senderId) {
                // If the sender is the same as the last message, combine the content
                lastMessage.content += `\n${curr.content}`;
                lastMessage.combinedKey += `_${curr.messageId}`;
            } else {
                // Otherwise, push a new message item to the array
                acc.push({ ...curr });
            }
            return acc;
        }, []);
    };


    const handleShowStickers = () => {
        setShowStickers(true);
    }

    const test = () => {
        mapRef.current?.animateCamera(
            {
                center: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                },
            },
            { duration: 1000 }
        );
    }

    const renderUserIcons = () => {
        const totalParticipants = participants.length;
        let iconSize = ICON_BASE_SIZE;

        const totalWidth = Math.min(totalParticipants * (iconSize), ICON_BASE_SIZE * MAX_ICONS_PER_ROW);

        // Diviser la taille des icônes si le nombre dépasse la limite
        if (totalParticipants > MAX_ICONS_PER_ROW) {
            iconSize = ICON_BASE_SIZE / 2 - 2;
        }

        return (
            <Animated.View style={[styles.userStackIconContainer, { width: totalWidth + 5 }]} entering={FadeIn.springify().damping(17)} exiting={FadeOut.springify().damping(17)}>
                {participants.map((user, index) => (
                    <Animated.View
                        key={user.userId}
                        entering={ZoomIn.springify().damping(17).randomDelay().delay(500)}
                        exiting={ZoomOut}
                        style={[
                            styles.userStackIcon,
                            { width: iconSize, height: iconSize },
                        ]}
                    >
                        <View style={[styles.userIconContainer, { borderRadius: iconSize / 2 }]}>
                            <Text style={[styles.userAvatarText, { fontSize: iconSize * 0.4 }]}>
                                {user.username.charAt(0)}
                            </Text>
                        </View>
                    </Animated.View>
                ))}
            </Animated.View>
        );
    };


    return (
        <View
            style={styles.container}
        >
            <Animated.View
                style={styles.messageSection}
                entering={StretchInY.springify().damping(17)}
                exiting={SlideOutDown.springify().damping(17)}
            >
                {/* Header Bandeau */}
                <View style={styles.markerHeader}>
                    <View style={styles.userStackContainer}>
                        <View style={styles.userStack}>
                            {participants.length > 0 && renderUserIcons()}
                            {participants.length > 0 && <Animated.View
                                key={marker.markerId}
                                entering={FadeIn.springify().damping(17).delay(participants.length * 15 + 500)}
                                style={styles.userCountBadge}>
                                <Text style={styles.userCountText}>{participants.length}</Text>
                                <FontAwesome6 name="users" size={13} color="gray" />
                            </Animated.View>
                            }
                        </View>
                    </View>
                    <Animated.View
                        style={{ flex: 2 }}
                        entering={FadeInRight.springify().damping(20)}
                        key={isSubscribed.toString()}
                    >
                        <TouchableOpacity style={styles.subscribeContainer} onPress={test}>
                            <View style={[
                                styles.subscribeIcon,
                                { backgroundColor: isSubscribed ? THEME.colors.primary : 'transparent' },
                            ]}>
                                {
                                    isSubscribed ? (
                                        <MaterialIcons name='favorite' size={18} color={THEME.colors.accent} />
                                    ) : (
                                        <Text style={styles.subscribeButton}>{'Subscribe'}</Text>
                                    )
                                }
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={combineMessages(messages)}
                    renderItem={({ item, index }) => {
                        // Check if there is a previous message and if it is from the same sender
                        const previousMessage = index > 0 ? messages[index - 1] : null;
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
                {
                    showStickers && (

                        <TouchableOpacity
                            onPress={() => setShowStickers(false)}
                            style={styles.closeStickerButton}
                        >
                            <Animated.View
                                entering={BounceIn.springify().damping(17)}
                            >
                                <FontAwesome6 name="circle-xmark" size={20} color="#D3D3D3" />
                            </Animated.View>
                        </TouchableOpacity>

                    )
                }
            </Animated.View>
            <Animated.View
                style={styles.inputSection}
                entering={marker.label !== '' ? SlideInDown.springify().damping(17) : undefined}
                exiting={SlideOutDown}
                key={showStickers.toString()}
            >
                {showStickers ? (
                    <View style={styles.stickerSelector}>
                        <Stickers />
                    </View>
                ) : (
                    <View style={styles.messageInputWrapper}>
                        <TextInput
                            ref={inputRef}
                            style={styles.messageInput}
                            placeholder="Tapez votre message..."
                            value={message}
                            onChangeText={setMessage}
                        />

                        {/* Bouton pour afficher la liste des stickers */}
                        <Animated.View
                            style={styles.toggleStickerButton}
                            key={isKeyboardVisible.toString()}
                            entering={ZoomIn.springify().damping(17)}
                            exiting={ZoomOut.springify().damping(17).duration(500)}
                        >
                            <TouchableOpacity onPress={handleShowStickers}>
                                {!isKeyboardVisible && (
                                    <MaterialCommunityIcons name="sticker-emoji" size={23} color="#D3D3D3" />
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Bouton d'envoi de message ou micro */}
                        <TouchableOpacity onPress={sendMessage} style={styles.sendMessageButton}>
                            <Animated.View style={styles.iconWrapper} key={isTyping.toString()} entering={ZoomIn.springify().damping(17).delay(100)}>
                                {
                                    isLoading ? (
                                        <ActivityIndicator size="small" color="#0088cc" />
                                    ) : (
                                        isTyping ? (
                                            <View style={styles.sendIcon}>
                                                <Ionicons name="send" size={15} color="white" />
                                            </View>
                                        ) : (
                                            <FontAwesome6 name="microphone" size={20} color="#D3D3D3" />
                                        )
                                    )
                                }
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    // Conteneur principal
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    // Bandeau du haut avec les utilisateurs
    markerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        overflow: 'hidden',
        borderBottomWidth: 0.5,
        borderColor: THEME.colors.grayscale.darker_x1,
        backgroundColor: THEME.colors.grayscale.darker_x1,
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
        flex: 10,
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
        paddingVertical: 10
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
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    // Conteneur d'entrée de message
    messageInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: THEME.colors.grayscale.main,
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.15)',
        borderWidth: 1,
        paddingHorizontal: 10,
        height: 45,
    },
    // Zone d'entrée de texte
    messageInput: {
        flex: 1,
        backgroundColor: THEME.colors.grayscale.main,
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
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0088cc',
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
});



export default MarkerChat;
