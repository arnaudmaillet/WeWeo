import React, { FC, useEffect, useRef, useState } from 'react'
import { NativeSyntheticEvent, NativeScrollEvent, View, Text } from 'react-native';
import { IMarker, IMessage } from '@contexts/markers/types';
import Animated from 'react-native-reanimated';
import { FlashList } from "@shopify/flash-list";

import Agent from '@components/post/Agent'
import Tabs from '@components/post/tabs/Tabs';
import Header from '@components/post/chat/Header';
import Preview from '@components/post/chat/Preview';
import Message from '@components/post/Message'

interface ScrollViewProps {
    data: IMessage[]
    post: IMarker
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const ScrollView: FC<ScrollViewProps> = ({ data, post, onScroll }: ScrollViewProps) => {

    const flatListRef = useRef<FlashList<string | IMessage>>(null);

    const [activeTab, setActiveTab] = useState<string>('🔥 Top');

    return (
        <Animated.View className='flex-auto mx-3.5 bg-grayscale-lighter_1x rounded-2xl shadow-inner overflow-hidden'>
            <FlashList
                ref={flatListRef}
                data={['Header', 'Agent', 'Chat', 'Tabs', ...data]}
                keyExtractor={(item: string | IMessage, index) => typeof item === 'string' ? item : index.toString()}
                renderItem={({ item }: { item: string | IMessage }) => {
                    switch (item) {
                        case 'Chat': return <Preview data={data} />
                        case 'Header': return <Header post={post} />
                        case 'Agent': return <Agent />
                        case 'Tabs': return <Tabs
                            setActive={setActiveTab}
                            active={activeTab}
                            onTitlePress={() => flatListRef.current?.scrollToIndex({ index: 0, animated: true, viewPosition: 1 })}
                            titleVisible={data.length > 0}
                            tabsVisible={data.length > 0}
                        />
                        default: return <Message self={item as IMessage} />
                    }
                }}
                contentContainerClassName='gap-2'
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                removeClippedSubviews={true}
                estimatedItemSize={200}
                getItemType={(item) => {
                    return typeof item === "string" ? "sectionHeader" : "row";
                }}
            />
        </Animated.View >
    )
}

export default ScrollView