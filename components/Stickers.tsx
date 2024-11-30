import React, { useEffect } from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
// import { Image } from 'expo-image';
import Animated, { BounceIn } from 'react-native-reanimated';
import { IFile, MimeTypes } from '~/types/MarkerInterfaces';
import { useMarker } from '~/contexts/MarkerProvider';

// const stickers: IFile[] = [
//     { name: "sticker1", uri: require('~/assets/stickers/sticker1.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker1.gif", type: MimeTypes.GIF },
//     { name: "sticker2", uri: require('~/assets/stickers/sticker2.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker2.gif", type: MimeTypes.GIF },
//     { name: "sticker3", uri: require('~/assets/stickers/sticker3.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker3.gif", type: MimeTypes.GIF },
//     { name: "sticker4", uri: require('~/assets/stickers/sticker4.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker4.gif", type: MimeTypes.GIF },
//     { name: "sticker5", uri: require('~/assets/stickers/sticker5.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker5.gif", type: MimeTypes.GIF },
//     { name: "sticker6", uri: require('~/assets/stickers/sticker6.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker6.gif", type: MimeTypes.GIF },
//     { name: "sticker7", uri: require('~/assets/stickers/sticker7.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker7.gif", type: MimeTypes.GIF },
//     { name: "sticker8", uri: require('~/assets/stickers/sticker8.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker8.gif", type: MimeTypes.GIF },
//     { name: "sticker9", uri: require('~/assets/stickers/sticker9.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker9.gif", type: MimeTypes.GIF },
//     { name: "sticker10", uri: require('~/assets/stickers/sticker10.gif'), url: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker10.gif", type: MimeTypes.GIF },
// ];


const Stickers: React.FC = () => {

    const { file, setFile, sendSticker } = useMarker();


    useEffect(() => {
        if (file) {
            sendSticker();
        }
    }, [file]);

    const handleStickerSend = (sticker: IFile) => {
        setFile(sticker);
    }

    const renderSticker = ({ item }: { item: IFile }) => (
        <TouchableOpacity onPress={() => handleStickerSend(item)}>
            <Animated.View entering={BounceIn.springify().damping(17).delay(500).randomDelay()}>
                {/* <Image source={{ uri: item.url }} style={styles.sticker} /> */}
            </Animated.View>
        </TouchableOpacity>
    );

    return null

    // return (
    //     <FlatList
    //         data={stickers}
    //         renderItem={renderSticker}
    //         keyExtractor={(item) => item.uri.toString()}
    //         contentContainerStyle={styles.stickerList}
    //         horizontal
    //         showsHorizontalScrollIndicator={false}
    //     />
    // );
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

export default Stickers;
