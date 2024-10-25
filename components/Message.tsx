// src/components/Message.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { BounceIn } from 'react-native-reanimated';
import { IMessage } from '~/types/MarkerInterfaces';
import users from '~/data/users.json';

interface MessageComponentProps {
    item: IMessage;
    isCurrentUser: boolean;
    currentUserId: string;
}

const Message: React.FC<MessageComponentProps> = ({ item, isCurrentUser, currentUserId }) => {
    const messageUser = users.data.find((user: { id: String }) => user.id === item.senderId);

    return (
        <View
            key={`${item.senderId}-${item.timestamp}-${item.content}`}
            style={[
                styles.messageContainer,
                isCurrentUser ? styles.currentUserMessageContainer : styles.otherUserMessageContainer
            ]}
        >
            {!isCurrentUser && (
                <Animated.View
                    style={styles.profileIconContainer}
                    entering={BounceIn.springify().stiffness(150).damping(100).delay(200).randomDelay()}
                >
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                            {messageUser?.username.slice(0, 2).toUpperCase()}
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
                <Text style={[styles.messageContent, { color: currentUserId === item.senderId ? 'white' : 'black' }]}>
                    {item.content}
                </Text>
                <Text style={[styles.messageTime, { color: currentUserId === item.senderId ? '#D3D3D3' : 'gray' }]}>
                    {new Date(item.timestamp * 1000).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    })}
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 5,
    },
    currentUserMessageContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-end',
        marginVertical: 5,
    },
    otherUserMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 5,
    },
    profileIconContainer: {
        width: 50,
        alignSelf: 'center',
        alignItems: 'center',
    },
    userAvatar: {
        width: 35,
        height: 35,
        borderRadius: 18,
        backgroundColor: '#0088cc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    messageBubble: {
        padding: 5,
        borderRadius: 10,
        maxWidth: '80%',
    },
    currentUserBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#0088cc',
    },
    otherUserBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f1f1',
    },
    usernameText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'gray',
        margin: 3,
    },
    messageContent: {
        color: 'black',
        margin: 3,
    },
    messageTime: {
        fontSize: 10,
        alignSelf: 'flex-end',
    },
});

export default Message;
