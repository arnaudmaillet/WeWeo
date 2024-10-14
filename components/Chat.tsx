import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity } from 'react-native'
import Animated, { BounceIn, FadeIn, SlideInDown, SlideOutDown, StretchInY, ZoomIn } from 'react-native-reanimated'
import users from '~/data/users'

import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { useState } from 'react';

interface MessageProps {
    userId: number,
    content: string,
    date: string
}

interface ChatProps {
    id: number,
    messages: MessageProps[]
    usersId: number[]
}

interface ChatScreenProps {
    chat: ChatProps,
    currentUserId: number
}

const ChatScreen: React.FC<ChatScreenProps> = ({ chat, currentUserId }) => {

    const [newMessageContent, setNewMessageContent] = useState<string>('')

    const isTyping = newMessageContent !== '';


    const renderMessage = ({ item, index }: { item: MessageProps, index: number }) => {

        const isCurrentUser = item.userId === currentUserId;
        const messageKey = `${index}-${item.content}`;
        const messageUser = users.data.find((user: { id: number }) => user.id === item.userId);

        return (
            <View
                key={messageKey}
                style={[
                    styles.messageWrapper,
                    isCurrentUser ? styles.currentUserMessageWrapper : styles.otherUserMessageWrapper
                ]}
            >
                {!isCurrentUser && (
                    <Animated.View
                        style={styles.profileIconContainer}
                        entering={BounceIn.springify().stiffness(150).damping(100).delay(200).randomDelay()}
                    >
                        <View style={styles.userIconMessage}>
                            <Text style={styles.userIconMessageText}>
                                {messageUser?.username}
                            </Text>
                        </View>
                    </Animated.View>
                )}
                <Animated.View
                    entering={BounceIn.springify().stiffness(150).damping(100).delay(200).randomDelay()}
                    style={[styles.messageBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}
                >
                    {!isCurrentUser && (
                        <Text style={styles.usernameText}>{messageUser?.username}</Text>
                    )}
                    <Text style={styles.messageText}>{item.content}</Text>
                    <Text style={styles.messageDate}>{new Date(item.date).toLocaleTimeString().slice(0, -3)}</Text>
                </Animated.View>
            </View>
        );
    };


    return (
        <View
            style={styles.container}
        >
            <Animated.View
                style={styles.messagesContainer}
                entering={StretchInY.springify().damping(17)}
                exiting={SlideOutDown}
            >
                {/* Header Bandeau */}
                <View style={styles.headerContainer}>
                    <View style={styles.userContainer}>
                        <View style={styles.userIcon}>
                            <Animated.Text style={styles.userIconText} key={chat.usersId[0]} entering={FadeIn.springify()}>
                                {users.data.find((user: { id: number }) => user.id === chat.usersId[0])?.username}
                            </Animated.Text>
                        </View>
                        <Animated.Text style={styles.userName} key={chat.usersId[0]} entering={FadeIn.springify()}>
                            {users.data.find((user: { id: number }) => user.id === chat.usersId[0])?.username}
                        </Animated.Text>
                    </View>
                    <View style={styles.firstMessageContainer}>
                        <Text
                            style={styles.firstMessageContent}
                            numberOfLines={1}
                        >
                            {chat.messages[0].content}
                        </Text>
                    </View>
                </View>

                <FlatList
                    data={chat.messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.messagesList}
                />
            </Animated.View>
            <Animated.View
                style={styles.inputContainer}
                entering={SlideInDown.springify().damping(17)}
                exiting={SlideOutDown}
            >
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        value={newMessageContent}
                        onChangeText={setNewMessageContent}
                    />
                    {/* Animated icon change between microphone and send button */}
                    <TouchableOpacity onPress={() => { }} style={styles.sendButton}>
                        <Animated.View style={styles.animatedIcon} key={isTyping.toString()} entering={ZoomIn.springify()}>
                            {isTyping ? (
                                <View style={styles.sendCircle}>
                                    <Ionicons name="send" size={15} color="white" />
                                </View>
                            ) : (
                                <FontAwesome6 name="microphone" size={20} color='#D3D3D3' />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        overflow: 'hidden', // Assurez-vous que le texte défilant reste dans la limite du conteneur
        margin: 10,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.025)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    userContainer: {
        display: 'flex',
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0088cc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    userIconText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        flex: 1,
    },
    firstMessageContainer: {
        flex: 6,
        overflow: 'hidden',
    },
    firstMessageContent: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'right',
    },


    messagesContainer: {
        flex: 4,
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
    messagesList: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    messageWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 5,
    },
    currentUserMessageWrapper: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-end',
        marginVertical: 5,
    },
    otherUserMessageWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 5,
    },
    profileIconContainer: {
        width: 50,
        alignSelf: 'center',
        alignItems: 'center',
    },
    userIconMessage: {
        width: 35,
        height: 35,
        borderRadius: 18,
        backgroundColor: '#0088cc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userIconMessageText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    usernameText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'gray',
        margin: 3,
    },
    currentUserBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#0088cc',
    },
    otherUserBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f1f1',
    },
    messageBubble: {
        padding: 5,
        borderRadius: 10,
        maxWidth: '80%',
    },
    messageText: {
        color: 'black',
        margin: 3,
    },
    messageDate: {
        fontSize: 10,
        color: 'gray',
        alignSelf: 'flex-end',
    },

    inputContainer: {
        width: '100%',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
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
    input: {
        flex: 1,

        backgroundColor: 'white',
        padding: 5,
    },
    animatedIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        padding: 2,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendCircle: {
        borderRadius: 15,
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0088cc',
    },
})

export default ChatScreen
