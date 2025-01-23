import { Dimensions, View, Text } from 'react-native'
import React, { FC, useEffect, useRef, useState } from 'react'
import { Image } from 'expo-image'
import { Zoomable } from '@likashefqet/react-native-image-zoom'
import { FlatList } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ImageProps {
    data: string[]
    active: number
}

const Images: FC<ImageProps> = ({ data, active }: ImageProps) => {

    const listRef = useRef<FlatList>(null)

    const { height, width } = Dimensions.get('window')
    const { bottom } = useSafeAreaInsets()

    const [currentIndex, setCurrentIndex] = useState(0)

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== currentIndex) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollToIndex({
                index: active,
                animated: false
            })
        }
    }, [active])

    return (
        <View>
            <FlatList
                ref={listRef}
                keyExtractor={(item, index) => index.toString()}
                data={data}
                renderItem={({ item }) => <Zoomable style={{ justifyContent: 'center' }} isDoubleTapEnabled>
                    <Image
                        source={item}
                        style={{
                            height: height,
                            width: width,
                        }}
                        contentFit='contain'
                        cachePolicy="memory"
                        transition={300} />
                </Zoomable>}
                horizontal
                snapToInterval={width}
                decelerationRate='fast'
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 70 }}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                removeClippedSubviews={true}
            />
            <View style={{
                position: 'absolute',
                bottom: bottom + 32,
                zIndex: 10,
                alignSelf: 'center',
                paddingVertical: 2,
                paddingHorizontal: 6,
                borderRadius: 5
            }} className='bg-black/50 opacity-50'>
                <Text className='text-white text-lg font-medium'>{currentIndex + 1} / {data.length}</Text>
            </View>
        </View>
    )
}

export default Images