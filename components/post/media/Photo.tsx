import React, { Dispatch, FC, SetStateAction } from 'react'
import { Image } from 'expo-image';
import { Zoomable } from '@likashefqet/react-native-image-zoom';

interface PhotoProps {
    self: string
    isHeaderVisible: boolean
    setIsHeaderVisible: Dispatch<SetStateAction<boolean>>
}

const Photo: FC<PhotoProps> = ({ self, isHeaderVisible, setIsHeaderVisible }: PhotoProps) => {
    return (
        <Zoomable
            isDoubleTapEnabled
            doubleTapScale={1}
            onDoubleTap={() => setIsHeaderVisible(!isHeaderVisible)}
        >
            <Image
                style={{ height: '100%', width: '100%' }}
                source={{ uri: self }}
                contentFit='cover'
            />
        </Zoomable>
    )
}

export default Photo