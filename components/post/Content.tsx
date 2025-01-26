import { View, Text } from 'react-native'
import React, { FC, useMemo, useState } from 'react'
import { IMarker } from '@contexts/markers/types'
import { FlatList } from 'react-native-gesture-handler'
import Image from '@components/post/media/gallery/Image'
import { MaterialIcons } from '@expo/vector-icons'
import { THEME } from '~/constants/constants'

interface ContentProps {
    post: IMarker
}

const imagesUri = [
    "https://images.unsplash.com/photo-1529391387768-ab39476d6a52?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542876974-aa06c4f5c6c4?q=80&w=2242&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542931415-162aeab4418f?q=80&w=2664&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542977466-bbacf83cb0b4?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542977466-bbacf83cb0b4?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542977466-bbacf83cb0b4?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542977466-bbacf83cb0b4?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542977466-bbacf83cb0b4?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542977466-bbacf83cb0b4?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542977466-bbacf83cb0b4?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1542977466-bbacf83cb0b4?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
]

const IMAGE_GAP_SIZE = 4
const MAX_ITEMS = 9 // MUST BE A SQUARE -> 4 || 9 || 16...

const Content: FC<ContentProps> = ({ post }: ContentProps) => {

    const [listWidth, setListWidth] = useState<number>(0)

    const onLayout = (event: any) => setListWidth(event.nativeEvent.layout.width)

    const extractList = (list: string[], maxItems: number): { list: string[], rest?: number } => {
        if (list.length <= maxItems) {
            return { list: list }
        } else {
            return { list: list.slice(0, MAX_ITEMS), rest: list.length - (maxItems - 1) }
        }
    }

    const data = useMemo(() => extractList(imagesUri, MAX_ITEMS), [imagesUri]);

    const numberOfColumns = useMemo(() => {
        const sqrt = data.list.length === 2 ? 2 : Math.sqrt(data.list.length);
        return Number.isInteger(sqrt) ? sqrt : Math.sqrt(MAX_ITEMS);
    }, [data.list.length]);

    const imageSize = useMemo(() => {
        return (listWidth / numberOfColumns) - IMAGE_GAP_SIZE;
    }, [listWidth, numberOfColumns]);

    return (
        <View className='px-3.5 gap-5'>
            <View className='flex-auto gap-0.5'>
                <View className="flex-auto flex-row gap-2">
                    <Text className="text-xl font-bold text-gray-600 leading-7">How to manage your money</Text>
                    <Text className="text-sm text-gray-300 leading-7">- 2m</Text>
                </View>
                <View className='flex-row items-center'>
                    <MaterialIcons name="location-on" size={12} color={THEME.colors.grayscale.darker_1x} />
                    <Text className='text-xs text-gray-300'>USA, Los Angeles</Text>
                </View>
            </View>
            <View className="flex-auto">
                <Text className="font-medium text-gray-400">
                    {post.label.length > 0 ? post.label : 'test'}
                </Text>
            </View>
            <View>
                {
                    post.markerId === '2bHQwNzQRaBhdStNlbgt' &&
                    <FlatList
                        data={data.list}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => <Image
                            self={item}
                            active={index}
                            fromList={imagesUri}
                            overlayLabel={index === MAX_ITEMS - 1 ? data.rest?.toString() : undefined}
                            dimensions={{ height: imageSize, width: imageSize }}
                            gap={IMAGE_GAP_SIZE / 2} />

                        }
                        numColumns={numberOfColumns}
                        onLayout={onLayout}
                        scrollEnabled={false}
                        removeClippedSubviews={true}
                        initialNumToRender={MAX_ITEMS}
                        maxToRenderPerBatch={MAX_ITEMS}
                    />
                }

            </View>
        </View>
    )
}

export default Content