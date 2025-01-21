import React, { FC, useRef, useState } from 'react'
import { FlatList } from 'react-native-gesture-handler'
import Message from './Message';
import { IMessage } from '~/contexts/markers/types';
import { View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import Agent from './Agent';
import Tabs from './Tabs';

interface CommentsProps {
    data: IMessage[]
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const DEFAULT_TABS_HEIGHT = 50

const Comments: FC<CommentsProps> = ({ data, onScroll }: CommentsProps) => {

    const flatListRef = useRef<FlatList>(null);

    const [activeTab, setActiveTab] = useState<string>('🔥 Top');
    const [tabsHeight, setTabsHeight] = useState<number | null>(null)


    return (
        <Animated.View className='flex-auto mx-3.5 bg-grayscale-lighter_1x rounded-2xl shadow-inner gap-5 overflow-hidden' layout={LinearTransition}>
            <View className='flex-auto'>
                <FlatList
                    ref={flatListRef}
                    data={['Tabs', ...data]}
                    keyExtractor={(item) => {
                        const typedItem = item as string | IMessage;
                        return typeof typedItem === 'string' ? typedItem : typedItem.messageId;
                    }}
                    renderItem={({ item }) => {
                        const typedItem = item as string | IMessage;
                        if (typeof typedItem === 'string') {
                            return <Tabs
                                setActive={setActiveTab}
                                active={activeTab}
                                onTitlePress={() => flatListRef.current?.scrollToIndex({ index: 1, animated: true, viewPosition: 0, viewOffset: tabsHeight || DEFAULT_TABS_HEIGHT })}
                                onLayout={(e) => setTabsHeight(e.nativeEvent.layout.height)}
                                titleVisible={data.length > 0}
                                tabsVisible={data.length > 0}
                            />
                        } else return <Message self={typedItem} />
                    }}
                    contentContainerClassName='gap-2'
                    showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0, 1]}
                    ListHeaderComponent={<Agent />}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                />
            </View>
        </Animated.View >
    )
}

export default Comments