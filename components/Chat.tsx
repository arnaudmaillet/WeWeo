import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity, Keyboard } from 'react-native'
import Animated, { BounceIn, FadeIn, FadeOut, SlideInDown, SlideInLeft, SlideOutDown, StretchInY, ZoomIn, ZoomOut } from 'react-native-reanimated'
import users from '~/data/users.json';

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { ChatScreenProps, ChatProps, MessageProps } from '~/types/ChatInterfaces';

import { useEffect, useState } from 'react';
import Stickers from './Stickers';
import Message from './Message';


const ChatScreen: React.FC<ChatScreenProps> = ({ chat, currentUserId }) => {

    const [newMessageContent, setNewMessageContent] = useState<string>('')

    const isTyping = newMessageContent !== '';

    const [showStickers, setShowStickers] = useState<boolean>(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    // Gérer l'envoi d'un sticker
    const handleStickerSend = (stickerSrc: any) => {
        console.log('Sticker sent:', stickerSrc);
        // Ajoutez la logique pour envoyer le sticker ici
    };

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true); // Le clavier est visible
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false); // Le clavier est caché
            }
        );

        // Nettoyage des écouteurs lors du démontage
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [])

    const renderUserIcon = ({ item, index }: { item: number, index: number }) => {
        const user = users.data.find((user: { id: number }) => user.id === item);

        // Le premier utilisateur est positionné normalement, les autres sont empilés en arrière-plan
        return (
            <Animated.View
                entering={SlideInLeft.springify().stiffness(150).damping(100).delay(index * 100)}
                key={chat.id}
                style={[
                    styles.userStackIcon,
                    {
                        left: index === 0 ? 0 : index * 15, // Décaler les autres icônes vers la gauche
                        zIndex: index === 0 ? 10 : 10 - index, // Le premier a le zIndex le plus grand
                    },
                ]}
            >
                <Animated.Text style={styles.userAvatarText} entering={FadeIn.springify()}>
                    {user?.username.slice(0, 2).toUpperCase()}
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
                <View style={styles.chatHeader}>
                    <View style={styles.userStackContainer}>
                        <View style={styles.userStack}>
                            {chat.participantsIds.reverse().map((userId: number, index: number) => (
                                <View key={index}>
                                    {renderUserIcon({ item: userId, index })}
                                </View>
                            ))}
                            <Animated.View
                                key={chat.id}
                                entering={FadeIn.springify().damping(17).delay(chat.participantsIds.length * 15 + 500)}
                                style={[
                                    styles.userCountBadge,
                                    { left: chat.participantsIds.length * 15 + 40 }, // Ajuster pour positionner à gauche du dernier icône
                                ]}>
                                <Text style={styles.userCountText}>{chat.participantsIds.length}</Text>
                                <FontAwesome6 name="users" size={13} color="gray" />
                            </Animated.View>
                        </View>
                    </View>
                    <View style={styles.firstMessageSection}>
                        <Animated.Text
                            key={chat.id}
                            entering={FadeIn.springify()}
                            style={styles.firstMessageText}
                            numberOfLines={1}
                        >
                            {chat.messages[0].content}
                        </Animated.Text>
                    </View>
                </View>

                <FlatList
                    data={chat.messages}
                    renderItem={({ item, index }) => (
                        <Message
                            key={index}
                            item={item}
                            isCurrentUser={item.userId === currentUserId}
                            currentUserId={currentUserId}
                        />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.messageList}
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
                entering={SlideInDown.springify().damping(17)}
                exiting={SlideOutDown}
                key={showStickers.toString()}
            >
                {showStickers ? (
                    <View style={styles.stickerSelector}>
                        <Stickers onStickerSend={handleStickerSend} />
                    </View>
                ) : (
                    <View style={styles.messageInputWrapper}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Tapez votre message..."
                            value={newMessageContent}
                            onChangeText={setNewMessageContent}
                        />

                        {/* Bouton pour afficher la liste des stickers */}
                        <Animated.View
                            style={styles.toggleStickerButton}
                            key={isKeyboardVisible.toString()}
                            entering={ZoomIn.springify().damping(17)}
                            exiting={ZoomOut.springify().damping(17).duration(500)}
                        >
                            <TouchableOpacity onPress={() => setShowStickers(!showStickers)}>
                                {!isKeyboardVisible && !isTyping && (
                                    <MaterialCommunityIcons name="sticker-emoji" size={23} color="#D3D3D3" />
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Bouton d'envoi de message ou micro */}
                        <TouchableOpacity onPress={() => { }} style={styles.sendMessageButton}>
                            <Animated.View style={styles.iconWrapper} key={isTyping.toString()} entering={ZoomIn.springify().damping(17).delay(100)}>
                                {isTyping ? (
                                    <View style={styles.sendIcon}>
                                        <Ionicons name="send" size={15} color="white" />
                                    </View>
                                ) : (
                                    <FontAwesome6 name="microphone" size={20} color="#D3D3D3" />
                                )}
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
    chatHeader: {
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
        paddingBottom: 10,
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



export default ChatScreen;
