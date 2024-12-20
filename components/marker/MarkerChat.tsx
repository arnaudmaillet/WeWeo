import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native'
import Animated, { FadeOutUp, StretchInY } from 'react-native-reanimated'

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import Message from './Message';

import { THEME } from '~/constants/constants';
import { useMarker } from '~/contexts/markers/Context';

import { useKeyboard } from '~/contexts/KeyboardProvider';
import MarkerHeader from './Header';
import MarkerInput from './Input';
import { useUser } from '~/contexts/user/Context';

export interface IMarkerChatScreen { }

const MarkerChat: React.FC<IMarkerChatScreen> = () => {

    const flatListRef = useRef<FlatList>(null);

    const { user } = useUser()
    const { state: markerState } = useMarker()
    const { isKeyboardVisible } = useKeyboard()

    if (!markerState.active || !user) return null

    const [showStickers, setShowStickers] = useState<boolean>(false)

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
            style={styles.container}
            entering={StretchInY.springify().damping(17)}
            exiting={FadeOutUp.springify()}
        >
            <MarkerHeader />
            <View style={styles.messageContainer}>
                {
                    markerState.active && !markerState.active.isLoading && markerState.active.messages && <FlatList
                        ref={flatListRef}
                        data={markerState.active.messages}
                        renderItem={({ item, index }) => {
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
                        contentContainerStyle={styles.messageList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                        getItemLayout={(_, index) => ({ length: 100, offset: 100 * index, index })}
                        showsVerticalScrollIndicator={false}
                    />
                }
            </View>
            <MarkerInput showStickers={showStickers} setShowStickers={setShowStickers} />
            <View style={styles.ellipsis}>
                <FontAwesome6 name="ellipsis" size={20} color={THEME.colors.grayscale.darker_3x} />
            </View>
        </Animated.View >
    )
}

const styles = StyleSheet.create({
    // Section des messages
    container: {
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
    messageContainer: {
        flex: 1
    },
    messageList: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    ellipsis: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: -3,
        left: '50%',
        transform: [{ translateX: -25 }],
        width: 50
    }
});



export default MarkerChat;
