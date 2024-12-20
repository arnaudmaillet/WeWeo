import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { BounceIn, FadeIn } from 'react-native-reanimated';
import { IMessage } from '~/types/MarkerInterfaces';
import { firestore } from '~/firebase';
import { doc, getDoc } from "firebase/firestore";

import locales from '~/data/locales.json';
import { THEME } from '~/constants/constants';
import { useUser } from '~/contexts/user/Context';
import { IUser } from '~/contexts/user/types';

interface MessageComponentProps {
    item: IMessage;
    previousMessage: IMessage | null;
}

const Message: React.FC<MessageComponentProps> = ({ item, previousMessage }) => {
    const { user } = useUser();
    const [senderInfo, setSenderInfo] = useState<IUser | null>(null);

    const isCurrentUser = user?.userId === item.senderId;

    // Fetch sender information
    useEffect(() => {
        const fetchSenderInfo = async () => {
            const userDoc = await getDoc(doc(firestore, "users", item.senderId));
            if (userDoc.exists()) {
                setSenderInfo(userDoc.data() as IUser);
            }
        };
        fetchSenderInfo();
    }, [item.senderId]);

    const renderContent = () => {
        if (item.type === 'sticker') {
            return <Image source={{ uri: item.content }} style={styles.sticker} />;
        } else {
            return (
                <Animated.Text style={isCurrentUser ? styles.messageTextCurrentUser : styles.messageText} entering={FadeIn.springify().stiffness(150).damping(100).delay(300).randomDelay()}>
                    {item.content}
                </Animated.Text>
            );
        }
    };

    const initials = senderInfo?.username.split(' ').map((n: string) => n[0]).join('');

    return (
        <View
            key={`${item.senderId}-${item.createdAt}-${item.content}`}
            style={[
                { marginVertical: previousMessage?.senderId === item.senderId ? 1 : 2 },
                isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
            ]}
        >
            {!isCurrentUser ? (
                <View style={styles.senderInfoContainer}>
                    {
                        previousMessage?.senderId !== item.senderId && <Text style={styles.senderUsername}>
                            {senderInfo?.username}
                        </Text>
                    }
                    <View style={styles.messageContentWrapper}>
                        {
                            previousMessage?.senderId !== item.senderId && <Animated.View
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
                        }
                        <Animated.View
                            entering={FadeIn.springify().stiffness(150).damping(100).delay(300).randomDelay()}
                            style={[styles.messageBubble, { alignSelf: 'flex-start' }, item.type === 'sticker' ? { backgroundColor: 'transparent' } : { backgroundColor: THEME.colors.grayscale.darker_1x }]}
                        >
                            {renderContent()}
                        </Animated.View>
                    </View>
                </View>
            ) : (
                <Animated.View
                    entering={FadeIn.springify().stiffness(150).damping(100).delay(200).randomDelay()}
                    style={[styles.messageBubble, { alignSelf: 'flex-end' }, item.type === 'sticker' ? { backgroundColor: 'transparent' } : { backgroundColor: THEME.colors.primary }]}
                >
                    {renderContent()}
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    currentUserContainer: {
        flexDirection: 'row-reverse',
    },
    otherUserContainer: {
        flexDirection: 'row',
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
        alignSelf: 'flex-end',
        alignItems: 'center',
        marginRight: 2,
        marginBottom: 1
    },
    senderAvatar: {
        width: 20,
        height: 20,
        borderRadius: 18,
        backgroundColor: THEME.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
    },
    flagContainer: {
        fontSize: 12,
        position: 'absolute',
        bottom: -5.5,
        right: -3,
    },
    messageBubble: {
        padding: 2,
        borderRadius: 7,
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
        fontSize: 13,
    },
    messageTextCurrentUser: {
        color: 'white',
        margin: 3,
        fontSize: 13,
    },
    sticker: {
        width: 70,
        height: 70,
        borderRadius: 10,
        resizeMode: 'contain',
    }
});

export default Message;
