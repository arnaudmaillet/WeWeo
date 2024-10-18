import React from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, { BounceIn } from 'react-native-reanimated';

const stickers = [
    { id: 1, src: require('~/assets/stickers/sticker1.gif') },
    { id: 2, src: require('~/assets/stickers/sticker2.gif') },
    { id: 3, src: require('~/assets/stickers/sticker3.gif') },
    { id: 4, src: require('~/assets/stickers/sticker4.gif') },
    { id: 5, src: require('~/assets/stickers/sticker5.gif') },
    { id: 6, src: require('~/assets/stickers/sticker6.gif') },
    { id: 7, src: require('~/assets/stickers/sticker7.gif') },
    { id: 8, src: require('~/assets/stickers/sticker8.gif') },
    { id: 9, src: require('~/assets/stickers/sticker9.gif') },
    { id: 10, src: require('~/assets/stickers/sticker10.gif') }
];

interface StickersProps {
    onStickerSend: (src: any) => void;
}

const Stickers: React.FC<StickersProps> = ({ onStickerSend }) => {

    const renderSticker = ({ item }: { item: { id: number, src: any } }) => (
        <TouchableOpacity onPress={() => onStickerSend(item.src)}>
            <Animated.View entering={BounceIn.springify().damping(17).delay(500).randomDelay()}>
                <Image source={item.src} style={styles.stickerImage} />
            </Animated.View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={stickers}
            renderItem={renderSticker}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.stickerList}
            horizontal
            showsHorizontalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    stickerList: {
        alignItems: 'center',
    },
    stickerImage: {
        width: 60,
        height: 50,
        margin: 5,
    },
});

export default Stickers;
