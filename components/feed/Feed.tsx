import { useState, useRef, FC } from 'react';
import { Dimensions, ViewToken } from 'react-native'
import Animated, { SlideInDown, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Post from '~/components/post/Post';
import { IMarker } from '~/contexts/markers/types';
import { useUserStore } from '~/store/useUserStore';


const Feed: FC = () => {
    const insets = useSafeAreaInsets();

    const { user, postFeed } = useUserStore()
    const { height } = Dimensions.get('window')

    const itemSpacing = 8
    const itemHeight = height * 0.85
    const itemFullHeight = itemHeight + itemSpacing

    const [currentPost, setCurrentPost] = useState<IMarker | null>(null)
    const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true)

    const scrollY = useSharedValue(0)
    const onScroll = useAnimatedScrollHandler(e => scrollY.value = e.contentOffset.y / itemFullHeight)

    if (!user) return null

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
        if (viewableItems.length > 0) {
            setCurrentPost(viewableItems[0].item)
        }
    }).current;

    return (
        <Animated.FlatList
            data={postFeed}
            renderItem={({ item, index }) => (
                <Post
                    post={item}
                    currentPostId={currentPost?.markerId}
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
        />
    )
}

export default Feed