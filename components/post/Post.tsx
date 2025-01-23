import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native'
import React, { Dispatch, FC, memo, SetStateAction, useEffect, useState } from 'react'
import { router } from 'expo-router';
import Animated, { interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';

import { useUserStore } from '~/store/useUserStore';
import { useWindowStore } from '~/store/useWindowStore';
import { useMessages } from '~/hooks/useMessages';

import Footer from './Footer';
import ScrollView from '~/components/post/ScrollView'
import Media from './media/Media';

import { WindowType } from '~/types/windowTypes';
import { IMarker } from '~/contexts/markers/types';

import { KEYBOARD_VERTICAL_OFFSET } from '~/constants/constants';
import Header from './Header';

const MARGIN_CARD_X = 10
const BORDER_CARD_WIDTH = 5

interface PostProps {
    index: number
    listLength: number
    post: IMarker
    currentPostId?: string
    height: number
    scrollY: SharedValue<number>
    isHeaderVisible: boolean
    setIsHeaderVisible: Dispatch<SetStateAction<boolean>>
}

const Post: FC<PostProps> = ({ index, listLength, currentPostId, post, height, scrollY, isHeaderVisible, setIsHeaderVisible }: PostProps) => {

    const { setActivePost } = useUserStore()
    const { set: setWindow } = useWindowStore()
    const { messages } = useMessages(post.markerId)


    const keyboardVerticalOffset = listLength === 1 ? KEYBOARD_VERTICAL_OFFSET.post.default : index === listLength - 1 ? KEYBOARD_VERTICAL_OFFSET.post.lastItem : KEYBOARD_VERTICAL_OFFSET.post.default;

    const backgroundColor = useSharedValue<number>(0)
    const headerHeight = useSharedValue<number>(0)

    const animatedBackgroundOpacity = useAnimatedStyle(() => {
        return {
            backgroundColor: `rgba(0, 0, 0, ${backgroundColor.value})`,
        };
    });

    const animatedVerticalScrollScaling = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: interpolate(
                        scrollY.value,
                        [index - 1, index, index + 1],
                        [.93, 1, .93]
                    ),
                }
            ]
        }
    })

    const renderLeftActions = () => (
        <View
            style={{
                flex: 1,
                backgroundColor: 'transparent',
                height: height,
            }}
        />
    );

    const handleSwipeableOpen = (direction: "left" | "right") => {
        if (direction === "left") {
            setActivePost(null)
            router.back()
            setWindow(WindowType.NAVBAR)
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        console.log('Scroll offset:', offsetY);
    };


    useEffect(() => {
        backgroundColor.value = withTiming(1, { duration: 1000 });
    }, []);

    return (
        <Swipeable
            renderLeftActions={renderLeftActions}
            overshootRight={false}
            overshootLeft={false}
            leftThreshold={0}
            onSwipeableWillOpen={(direction) => handleSwipeableOpen(direction)}
        >
            <Animated.View
                className={`flex-auto bg-grayscale rounded-3xl mx-[10px] py-3.5 gap-3 z-10`}
                style={[animatedVerticalScrollScaling, { height: height }]}
            >
                <ScrollView data={messages.data || []} post={post} />
                <Footer keyboardVerticalOffset={keyboardVerticalOffset} comments={messages.data?.length || 0} />
            </Animated.View>
            {/* <Animated.View
                className={`flex-auto rounded-3xl mx-[${MARGIN_CARD_X}px] border-[${BORDER_CARD_WIDTH}px] border-grayscale gap-3 z-10 overflow-hidden`}
                style={[animatedVerticalScrollScaling, animatedBackgroundOpacity, { height: height }]}
            >
                <Media offsetY={MARGIN_CARD_X * 2 + BORDER_CARD_WIDTH * 2} isHeaderVisible={isHeaderVisible} setIsHeaderVisible={setIsHeaderVisible} />
                <Header post={post} isCurrentPost={currentPostId === post.markerId} isVisible={isHeaderVisible} />
            </Animated.View> */}
        </Swipeable>
    )
}

export default memo(Post)