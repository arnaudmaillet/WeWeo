import { Dimensions, View } from 'react-native';
import React, { Dispatch, FC, SetStateAction } from 'react'
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from 'react-native-reanimated';
import { THEME } from '~/constants/constants';
import Photo from './Photo';


interface MediaProps {
    offsetY: number
    isHeaderVisible: boolean
    setIsHeaderVisible: Dispatch<SetStateAction<boolean>>
}

const Media: FC<MediaProps> = ({ offsetY, isHeaderVisible, setIsHeaderVisible }: MediaProps) => {

    const { width } = Dimensions.get('window')

    const ref = React.useRef<ICarouselInstance>(null);

    const imagesUri = [
        "https://images.unsplash.com/photo-1529391387768-ab39476d6a52?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1542876974-aa06c4f5c6c4?q=80&w=2242&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1542931415-162aeab4418f?q=80&w=2664&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1542977466-bbacf83cb0b4?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

    ]

    const progress = useSharedValue<number>(0);

    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            count: index - progress.value,
            animated: true,
        });
    };

    return (
        <View className="flex-auto">
            <Carousel
                ref={ref}
                width={width - offsetY}
                vertical={false}
                loop
                data={imagesUri}
                onProgressChange={progress}
                renderItem={({ item }) => <Photo self={item} isHeaderVisible={isHeaderVisible} setIsHeaderVisible={setIsHeaderVisible} />}
            />
            <Pagination.Basic<{ color: string }>
                progress={progress}
                data={imagesUri.map((color) => ({ color }))}
                size={8}
                dotStyle={{
                    borderRadius: 100,
                    backgroundColor: THEME.colors.grayscale.darker_1x,
                }}
                activeDotStyle={{
                    borderRadius: 100,
                    overflow: "hidden",
                    backgroundColor: THEME.colors.grayscale.darker_3x
                }}
                containerStyle={[
                    {
                        gap: 5,
                        position: 'absolute',
                        bottom: 10
                    },
                ]}
                horizontal
                onPress={onPressPagination}
            />
        </View>
    );
};

export default Media;
