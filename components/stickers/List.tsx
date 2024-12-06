import React, { useEffect } from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, { BounceIn } from 'react-native-reanimated';
import { IFile, MimeTypes } from '~/types/MarkerInterfaces';
import { useMarker } from '~/contexts/markers/Context';

export const stickers: IFile[] = [
    { name: "sticker1", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker1.gif", type: MimeTypes.GIF },
    { name: "sticker2", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker2.gif", type: MimeTypes.GIF },
    { name: "sticker3", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker3.gif", type: MimeTypes.GIF },
    { name: "sticker4", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker4.gif", type: MimeTypes.GIF },
    { name: "sticker5", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker5.gif", type: MimeTypes.GIF },
    { name: "sticker6", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker6.gif", type: MimeTypes.GIF },
    { name: "sticker7", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker7.gif", type: MimeTypes.GIF },
    { name: "sticker8", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker8.gif", type: MimeTypes.GIF },
    { name: "sticker9", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker9.gif", type: MimeTypes.GIF },
    { name: "sticker10", url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker10.gif", type: MimeTypes.GIF },
];

interface StickerListProps {
    isHorizontal: boolean
    onClickItem: (url: string) => void
}

const StickersList: React.FC<StickerListProps> = ({ isHorizontal, onClickItem }) => {

    const renderSticker = ({ item }: { item: IFile }) => (
        <TouchableOpacity onPress={() => onClickItem(item.url)}>
            <Animated.View entering={BounceIn.springify().damping(17).delay(500).randomDelay()}>
                <Image source={{ uri: item.url }} style={styles.sticker} />
            </Animated.View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={stickers}
            renderItem={renderSticker}
            keyExtractor={(item) => item.url}
            contentContainerStyle={styles.stickerList}
            numColumns={isHorizontal ? undefined : 5}
            horizontal={isHorizontal ? true : undefined}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    stickerList: {
        alignItems: 'center',
    },
    sticker: {
        width: 60,
        height: 50,
        margin: 5,
    },
});

export default StickersList;
