import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { BounceIn, FadeOut } from 'react-native-reanimated';
import { IMessage } from '~/types/MarkerInterfaces';
import { useAuth } from '~/providers/AuthProvider';
import { IUser } from '~/types/UserInterfaces';

interface MessageComponentProps {
    item: IMessage;
    previousSender: IUser | null;
}

const Message: React.FC<MessageComponentProps> = ({ item, previousSender }) => {
    const { user } = useAuth();

    const isCurrentUser = user?.id === item.senderInfo.id;

    return (
        <View
            key={`${item.senderInfo.id}-${item.timestamp}-${item.content}`}
            style={[
                styles.messageContainer,
                isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
            ]}
        >
            {!isCurrentUser ? (
                <View style={styles.senderInfoContainer}>
                    {previousSender?.id !== item.senderInfo.id && (
                        <Text style={styles.senderUsername}>
                            {item.senderInfo.username}
                        </Text>
                    )}
                    <View style={styles.messageContentWrapper}>
                        {previousSender?.id !== item.senderInfo.id && (
                            <Animated.View
                                style={styles.avatarContainer}
                                entering={BounceIn.springify().stiffness(150).damping(100).delay(300).randomDelay()}
                            >
                                <View style={styles.senderAvatar}>
                                    <Text style={styles.avatarText}>
                                        {item.senderInfo.username && item.senderInfo.username.slice(0, 2).toUpperCase()}
                                    </Text>
                                </View>
                            </Animated.View>
                        )}
                        <Animated.View
                            entering={BounceIn.springify().stiffness(150).damping(100).delay(300).randomDelay()}
                            style={[styles.messageBubble, styles.otherUserBubble]}
                        >
                            <Text style={styles.messageText}>
                                {item.content}
                            </Text>
                            <Text style={styles.messageTimestamp}>
                                {new Date(item.timestamp * 1000).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </Text>
                        </Animated.View>
                    </View>
                </View>
            ) : (
                <Animated.View
                    entering={BounceIn.springify().stiffness(150).damping(100).delay(200).randomDelay()}
                    style={[styles.messageBubble, styles.currentUserBubble]}
                >
                    <Text style={styles.messageTextCurrentUser}>
                        {item.content}
                    </Text>
                    <Text style={styles.messageTimestampCurrentUser}>
                        {new Date(item.timestamp * 1000).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })}
                    </Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: 5,
        flexDirection: 'row',
    },
    currentUserContainer: {
        flexDirection: 'row-reverse',
        marginVertical: 5,
    },
    otherUserContainer: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    senderInfoContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    messageContentWrapper: {
        flex: 1,
        flexDirection: 'row',
    },
    avatarContainer: {
        width: 30,
        alignSelf: 'center',
        alignItems: 'center',
        marginRight: 2,
    },
    senderAvatar: {
        width: 25,
        height: 25,
        borderRadius: 18,
        backgroundColor: '#0088cc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
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
        backgroundColor: '#0088cc',
        alignSelf: 'flex-end',
    },
    otherUserBubble: {
        backgroundColor: '#f1f1f1',
        alignSelf: 'flex-start',
    },
    senderUsername: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'gray',
        marginBottom: 2,
        marginLeft: 35,
    },
    messageText: {
        color: 'black',
        margin: 3,
    },
    messageTextCurrentUser: {
        color: 'white',
        margin: 3,
    },
    messageTimestamp: {
        fontSize: 9,
        color: 'gray',
        alignSelf: 'flex-end',
    },
    messageTimestampCurrentUser: {
        fontSize: 9,
        color: '#D3D3D3',
        alignSelf: 'flex-end',
    },
});

export default Message;

