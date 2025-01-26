import { useState, useRef, FC } from 'react';
import { Dimensions, ViewToken } from 'react-native'
import Animated, { SlideInDown, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IMarker } from '~/contexts/markers/types';
import Post from '@components/post/Post'
import { useUserStore } from '~/store/useUserStore';


const Feed: FC = () => {
    const insets = useSafeAreaInsets();

    const { user, postFeed, activePost, setActivePost } = useUserStore()
    const { height } = Dimensions.get('window')

    const itemSpacing = 8
    const itemHeight = height * 0.85
    const itemFullHeight = itemHeight + itemSpacing

    const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true)

    const scrollY = useSharedValue(0)
    const onScroll = useAnimatedScrollHandler(e => scrollY.value = e.contentOffset.y / itemFullHeight)

    if (!user) return null

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
        if (viewableItems.length > 0) {
            setActivePost(viewableItems[0].item)
        }
    }).current;

    return (
        <Animated.FlatList
            data={postFeed}
            renderItem={({ item, index }) => (
                <Post
                    post={item}
                    index={index}
                    listLength={postFeed!.length}
                    height={itemHeight}
                    scrollY={scrollY}
                    isHeaderVisible={isHeaderVisible}
                    setIsHeaderVisible={setIsHeaderVisible}
                />
            )}
            contentContainerStyle={{ gap: itemSpacing, paddingTop: (height - itemFullHeight) / 2, paddingBottom: insets.bottom }}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemFullHeight}
            decelerationRate={"fast"}
            onScroll={onScroll}
            scrollEventThrottle={16}
            viewabilityConfig={{ itemVisiblePercentThreshold: 99 }}
            onViewableItemsChanged={onViewableItemsChanged}
            entering={SlideInDown.springify().mass(.2).damping(7.5)}
            keyboardShouldPersistTaps='always'
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            disableScrollViewPanResponder={true}
            removeClippedSubviews={true}
        />
    )
}

export default Feed