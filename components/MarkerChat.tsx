import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity, Keyboard, ActivityIndicator } from 'react-native'
import Animated, { BounceIn, FadeIn, SlideInDown, SlideInLeft, SlideOutDown, StretchInY, ZoomIn, ZoomOut } from 'react-native-reanimated'

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { IMarkerChatScreen } from '~/types/MarkerInterfaces';

import Stickers from './Stickers';
import Message from './Message';

import { useMarker } from '~/providers/MarkerProvider';
import { IUser } from '~/types/UserInterfaces';


const MarkerChat: React.FC<IMarkerChatScreen> = ({ marker }) => {

    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);

    const { isLoading, message, messages, participants, setMessage, setMessages, setParticipants, sendMessage } = useMarker()

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
    }, [marker])

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
    }, []);

    const handleShowStickers = () => {
        setShowStickers(true);
    }

    const renderUserIcon = ({ user, index }: { user: IUser, index: number }) => {
        // Récupérer les initiales : 2 lettres si deux mots, sinon une seule lettre
        const initials = user.username
            ? user.username.split(' ').length > 1
                ? user.username.split(' ').slice(0, 2).map(word => word[0].toUpperCase()).join('')
                : user.username[0].toUpperCase()
            : '';

        return (
            <Animated.View
                entering={SlideInLeft.springify().stiffness(150).damping(100).delay(index * 100)}
                key={user.userId}
                style={[
                    styles.userStackIcon,
                    {
                        left: index === 0 ? 0 : index * 15, // Décaler les autres icônes vers la gauche
                        zIndex: index === 0 ? 10 : 10 - index, // Le premier a le zIndex le plus grand
                    },
                ]}
            >
                <Animated.Text style={styles.userAvatarText} entering={FadeIn.springify()}>
                    {initials}
                </Animated.Text>
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
                exiting={SlideOutDown}
            >
                {/* Header Bandeau */}
                <View style={styles.markerHeader}>
                    <View style={styles.userStackContainer}>
                        <View style={styles.userStack}>
                            {marker.label === '' ? (
                                <TextInput
                                    style={styles.firstMessageText}
                                    placeholder="Send your first message here!"
                                    value={message}
                                    onChangeText={setMessage}
                                    editable={false}
                                />
                            ) : (
                                <View>
                                    {participants && participants.map((user: IUser, index: number) => (
                                        <View key={index}>
                                            {renderUserIcon({ user: user, index })}
                                        </View>
                                    ))}
                                    {participants.length > 0 && <Animated.View
                                        key={marker.markerId}
                                        entering={FadeIn.springify().damping(17).delay(participants.length * 15 + 500)}
                                        style={[
                                            styles.userCountBadge,
                                            { left: participants.length * 15 + 40 }, // Ajuster pour positionner à gauche du dernier icône
                                        ]}>
                                        <Text style={styles.userCountText}>{participants.length}</Text>
                                        <FontAwesome6 name="users" size={13} color="gray" />
                                    </Animated.View>
                                    }
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={styles.firstMessageSection}>
                        <Animated.Text
                            key={marker.markerId}
                            entering={FadeIn.springify()}
                            style={styles.firstMessageText}
                            numberOfLines={1}
                        >
                            {marker.label}
                        </Animated.Text>
                    </View>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item, index }) => (
                        <Message
                            key={item.messageId}
                            item={item}
                            previousSender={index > 0 ? messages[index - 1].senderInfo : null}
                        />
                    )}
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
        borderWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.01)',
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
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        margin: 10,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.025)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    // Conteneur pour l'empilement d'icônes d'utilisateurs
    userStackContainer: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Style pour l'empilement des utilisateurs
    userStack: {
        flexDirection: 'row',
        height: 40,
        width: '100%',
    },
    // Icônes empilées des utilisateurs
    userStackIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0088cc',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'white',
    },
    // Texte à l'intérieur de l'avatar
    userAvatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Badge pour le nombre d'utilisateurs
    userCountBadge: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        zIndex: 1,
    },
    // Texte du nombre d'utilisateurs
    userCountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'gray',
        marginRight: 5,
    },
    // Section affichant le premier message
    firstMessageSection: {
        flex: 4,
        overflow: 'hidden',
    },
    // Texte du premier message
    firstMessageText: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'right',
    },
    // Section des messages
    messageSection: {
        flex: 10,
        width: '100%',
        backgroundColor: 'white',
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
        backgroundColor: 'white',
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.15)',
        borderWidth: 1,
        paddingHorizontal: 10,
        height: 45,
    },
    // Zone d'entrée de texte
    messageInput: {
        flex: 1,
        backgroundColor: 'white',
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
