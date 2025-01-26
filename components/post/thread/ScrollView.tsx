import React, { FC, useRef, useState } from 'react'
import { FlatList } from 'react-native-gesture-handler'
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { IMarker, IMessage } from '@contexts/markers/types';
import Animated from 'react-native-reanimated';

import Agent from '@components/post/Agent'
import Tabs from '~/components/post/tabs/Tabs';
import Header from '@components/post/thread/Header';
import Content from '@components/post/Content';
import Message from '@components/post/Message'

interface ScrollViewProps {
    data: IMessage[]
    post: IMarker
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const ScrollView: FC<ScrollViewProps> = ({ data, post, onScroll }: ScrollViewProps) => {

    const flatListRef = useRef<FlatList>(null);

    const [activeTab, setActiveTab] = useState<string>('🔥 Top');


    return (
        <Animated.View className='flex-auto mx-3.5 bg-grayscale-lighter_1x rounded-2xl shadow-inner overflow-hidden'>
            <FlatList
                ref={flatListRef}
                data={['Content', 'Agent', 'Tabs', ...data]}
                keyExtractor={(item: string | IMessage) => typeof item === 'string' ? item : item.messageId}
                renderItem={({ item }: { item: string | IMessage }) => {
                    switch (item) {
                        case 'Content': return <Content post={post} />
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
                ListHeaderComponent={<Header post={post} isCurrentPost />}
                stickyHeaderIndices={[0, 3]}
                onScroll={onScroll}
                scrollEventThrottle={16}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                removeClippedSubviews={true}
            />
        </Animated.View >
    )
}

export default ScrollView