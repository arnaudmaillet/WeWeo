import React, { FC, useRef, useState } from 'react';
import { FlatList, Text, View, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Animated, { SlideInLeft, ZoomInEasyDown, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IMessage } from '~/contexts/markers/types';
import { IUser } from '~/types/userTypes';
import Input from '../Input';
import { useUserStore } from '~/store/useUserStore';
import { useKeyboard } from '~/contexts/KeyboardProvider';
import { Image } from 'expo-image';

type ChatProps = {
    messages: IMessage[];
    currentUser: IUser | null;
    onSendMessage?: (message: string) => void;
}

const Chat: FC<ChatProps> = ({ messages, currentUser, onSendMessage }) => {
    const flatListRef = useRef<FlatList>(null);
    const { isIncognito, setIsIncognito } = useUserStore();
    const { isKeyboardVisible } = useKeyboard();
    const { bottom } = useSafeAreaInsets();

    const [isUserIconLoading, setIsUserIconLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('');

    const isCurrentUser = (senderId: string) => senderId === currentUser?.userId;

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage?.(message);
            setMessage('');
        }
    };

    const renderItem = ({ item }: { item: IMessage }) => {
        const isUserMessage = isCurrentUser(item.senderId);
        return (
            <Animated.View
                entering={SlideInLeft.springify().mass(.5)}
                className='flex-row items-center mb-1.5'
            >
                <View className='flex-row gap-2 px-3 py-2 rounded-xl bg-grayscale-darker_1x'>
                    <Animated.View entering={ZoomInEasyDown.springify().mass(.2)} exiting={ZoomOut.springify().mass(.2)} className='w-[25] h-[25] z-10 bg-grayscale-darker_2x rounded-full justify-center items-center overflow-hidden'>
                        {
                            !isUserIconLoading && <ActivityIndicator size='small' style={{ position: 'absolute', alignSelf: 'center' }} />
                        }
                        <Image
                            source={'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker5.gif'}
                            style={{ height: 25, width: 25, zIndex: 10 }}
                            contentFit="contain"
                            allowDownscaling={false}
                            onLoadEnd={() => setIsUserIconLoading(true)}
                        />
                    </Animated.View>
                    <Text className='shrink self-center text-sm text-gray-900'>
                        <Text className="font-semibold text-gray-500">arnaud.m</Text>   {item.content}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={bottom + 40}
        >
            <View className="flex-1">
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.messageId}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: isKeyboardVisible ? 10 : 0 }}
                    onContentSizeChange={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), .001)}
                    showsVerticalScrollIndicator={false}
                />

                <View
                    className="flex flex-row items-center py-3 px-5 bg-grayscale-lighter_1x border-t border-gray-300"
                    style={{ paddingBottom: bottom }}
                >
                    <Input
                        placeholder="Message ..."
                        activePlaceholder={isIncognito ? '@anonymous-938354' : '@Arnaud.M'}
                        isIconVisible
                        isActive={isIncognito}
                        onIconPress={() => setIsIncognito(!isIncognito)}
                        value={message}
                        onChangeText={setMessage}
                        onSubmitEditing={handleSend}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Chat;
