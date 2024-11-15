import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { BounceIn } from 'react-native-reanimated';
import { IMessage } from '~/types/MarkerInterfaces';
import { useAuth } from '~/providers/AuthProvider';
import { IUser } from '~/types/UserInterfaces';
import { firestore } from '~/firebase';
import { doc, getDoc } from "firebase/firestore";

import locales from '~/data/locales.json';
import { THEME } from '~/constants/constants';

interface MessageComponentProps {
    item: IMessage;
    previousSender: IUser | null;
}

const Message: React.FC<MessageComponentProps> = ({ item, previousSender }) => {
    const { user } = useAuth();
    const [senderInfo, setSenderInfo] = useState<IUser | null>(null);

    const isCurrentUser = user?.userId === item.senderId;

    // Récupère les informations de l'utilisateur en fonction de senderId
    useEffect(() => {
        const fetchsenderInfo = async () => {
            const userDoc = await getDoc(doc(firestore, "users", item.senderId));
            if (userDoc.exists()) {
                setSenderInfo(userDoc.data() as IUser);
            }
        };
        fetchsenderInfo();
    }, [item.senderId]);

    const renderContent = () => {
        if (item.type === 'sticker') {
            return <Image source={{ uri: item.content }} style={styles.sticker} />;
        } else {
            return <Text style={isCurrentUser ? styles.messageTextCurrentUser : styles.messageText}>{item.content}</Text>;
        }
    };

    const initials = senderInfo?.username.split(' ').map((n: string) => n[0]).join('');

    return (
        <View
            key={`${item.senderId}-${item.createdAt}-${item.content}`}
            style={[
                styles.messageContainer,
                isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
            ]}
        >
            {!isCurrentUser ? (
                <View style={styles.senderInfoContainer}>
                    {previousSender?.userId !== item.senderId && (
                        <Text style={styles.senderUsername}>
                            {senderInfo?.username}
                        </Text>
                    )}
                    <View style={styles.messageContentWrapper}>
                        {previousSender?.userId !== item.senderId && (
                            <Animated.View
                                style={styles.avatarContainer}
                                entering={BounceIn.springify().stiffness(150).damping(100).delay(300).randomDelay()}
                            >
                                <View style={styles.senderAvatar}>
                                    <Text style={styles.avatarText}>
                                        {initials}
                                    </Text>
                                    <Text style={styles.flagContainer}>
                                        {locales.data.find(locale => locale.value === senderInfo?.locale)?.flag}
                                    </Text>
                                </View>
                            </Animated.View>
                        )}
                        <Animated.View
                            entering={BounceIn.springify().stiffness(150).damping(100).delay(300).randomDelay()}
                            style={[styles.messageBubble, { alignSelf: 'flex-start' }, item.type === 'sticker' ? { backgroundColor: 'transparent' } : { backgroundColor: THEME.colors.background.darker_x1 }]}
                        >
                            {renderContent()}
                        </Animated.View>
                    </View>
                </View>
            ) : (
                <Animated.View
                    entering={BounceIn.springify().stiffness(150).damping(100).delay(200).randomDelay()}
                    style={[styles.messageBubble, { alignSelf: 'flex-end' }, item.type === 'sticker' ? { backgroundColor: 'transparent' } : { backgroundColor: THEME.colors.primary }]}
                >
                    {renderContent()}
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
        backgroundColor: THEME.colors.primary,
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
        backgroundColor: THEME.colors.accent,
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
    sticker: {
        width: 70,
        height: 70,
        borderRadius: 10,
        resizeMode: 'contain',
    }
});

export default Message;
