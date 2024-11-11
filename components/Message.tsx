import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { BounceIn } from 'react-native-reanimated';
import { IMessage } from '~/types/MarkerInterfaces';
import { useAuth } from '~/providers/AuthProvider';
import { IUser } from '~/types/UserInterfaces';

import locales from '~/data/locales.json';

interface MessageComponentProps {
    item: IMessage;
    previousSender: IUser | null;
}

const Message: React.FC<MessageComponentProps> = ({ item, previousSender }) => {
    const { user } = useAuth();

    const isCurrentUser = user?.userId === item.senderInfo.userId;

    const renderContent = () => {
        if (item.type === 'sticker') {
            return <Image source={{ uri: item.content }} style={styles.sticker} />;
        } else return <Text style={isCurrentUser ? styles.messageTextCurrentUser : styles.messageText}>{item.content}</Text>;
    };

    const initials = item.senderInfo.username
        ? item.senderInfo.username.split(' ').length > 1
            ? item.senderInfo.username.split(' ').slice(0, 2).map(word => word[0].toUpperCase()).join('')
            : item.senderInfo.username[0].toUpperCase()
        : '';

    return (
        <View
            key={`${item.senderInfo.userId}-${item.timestamp}-${item.content}`}
            style={[
                styles.messageContainer,
                isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
            ]}
        >
            {!isCurrentUser ? (
                <View style={styles.senderInfoContainer}>
                    {previousSender?.userId !== item.senderInfo.userId && (
                        <Text style={styles.senderUsername}>
                            {item.senderInfo.username}
                        </Text>
                    )}
                    <View style={styles.messageContentWrapper}>
                        {previousSender?.userId !== item.senderInfo.userId && (
                            <Animated.View
                                style={styles.avatarContainer}
                                entering={BounceIn.springify().stiffness(150).damping(100).delay(300).randomDelay()}
                            >
                                <View style={styles.senderAvatar}>
                                    <Text style={styles.avatarText}>
                                        {initials}
                                    </Text>
                                    <Text style={styles.flagContainer}>
                                        {locales.data.find(locale => locale.value === item.senderInfo.locale)?.flag}
                                    </Text>
                                </View>
                            </Animated.View>
                        )}
                        <Animated.View
                            entering={BounceIn.springify().stiffness(150).damping(100).delay(300).randomDelay()}
                            style={[styles.messageBubble, { alignSelf: 'flex-start' }, item.type === 'sticker' ? { backgroundColor: 'transparent' } : { backgroundColor: '#f1f1f1' }]}
                        >
                            {renderContent()}
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
                    style={[styles.messageBubble, { alignSelf: 'flex-end' }, item.type === 'sticker' ? { backgroundColor: 'transparent' } : { backgroundColor: '#0088cc' }]}
                >
                    {renderContent()}
                    {item.type === 'message' && (
                        <Text style={styles.messageTimestampCurrentUser}>
                            {new Date(item.timestamp * 1000).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </Text>
                    )}
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
        width: 30,
        height: 30,
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
    flagContainer: {
        fontSize: 14,
        position: 'absolute',
        bottom: -5.5,
        right: -3,
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
    sticker: {
        width: 70,
        height: 70,
        borderRadius: 10,
        resizeMode: 'contain',
    }
});

export default Message;
