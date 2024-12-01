import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import Animated, { BounceIn, FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, runOnJS, SlideInDown, SlideInUp, SlideOutDown, useAnimatedStyle, useSharedValue, withSpring, ZoomInEasyDown, ZoomInEasyUp, ZoomOutDown, ZoomOutEasyDown, ZoomOutEasyUp } from 'react-native-reanimated'
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { INPUT, THEME } from '~/constants/constants'
import { useMap } from '~/contexts/MapProvider'
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { IUser } from '~/types/UserInterfaces'
import { useAuth } from '~/contexts/AuthProvider'
import { useWindow } from '~/contexts/window/Context'
import { useMarker } from '~/contexts/marker/Context'
import { Image } from 'expo-image';
import { IFile, MimeTypes } from '~/types/MarkerInterfaces'

enum Selector {
    EVERYONE = 'everyone',
    FRIENDS = 'friends',
}

const stickers: IFile[] = [
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

interface NewMarkerProps { }


const NewMarker: React.FC<NewMarkerProps> = () => {

    const [inputValue, setInputValue] = useState<string>('')
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [damplingValue, setDamplingValue] = useState<number>(100);
    const [heightContainer, setHeightContainer] = useState(0)
    const [isStickersOpen, setIsStickersOpen] = useState<boolean>(false)

    const { user } = useAuth();
    const { state: windowState, setLoaded: setWindowLoaded } = useWindow()
    const { state: markerState, updateNew: updateNewMarker, addNew: addNewMarker } = useMarker()

    const friendsContainer = useSharedValue(0)


    const handleSelectFriend = (friendId: string) => {
        setSelectedFriends((prev) =>
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    const animatedStyle = useAnimatedStyle(() => ({
        height: windowState.isLoaded ? withSpring(heightContainer + friendsContainer.value, { damping: damplingValue }, (finished) => {
            finished && runOnJS(setDamplingValue)(14)
        }) : undefined
    }));

    const UserItem: React.FC<{ user: IUser }> = ({ user }) => {
        const isSelected = selectedFriends.includes(user.userId);

        return (
            <View style={styles.flatListItem}>
                <TouchableWithoutFeedback
                    style={[styles.accountIconContainer, isSelected && styles.selectedFriend]}
                    onPress={() => handleSelectFriend(user.userId)}
                >
                    <Text style={[styles.accountIconText, isSelected && styles.selectedFriendText]}>
                        {user.username.slice(0, 2).toUpperCase()}
                    </Text>
                </TouchableWithoutFeedback>
                <View>
                    <Text style={{ color: 'gray', fontSize: 10 }}>
                        {user.username.length > 6 ? user.username.slice(0, 6) + '...' : user.username}
                    </Text>
                </View>
            </View>
        );
    };

    const renderSticker = ({ item }: { item: IFile }) => (
        <TouchableOpacity onPress={() => updateNewMarker({ icon: item.url })}>
            <Animated.View entering={BounceIn.springify().damping(17).delay(500).randomDelay()}>
                <Image source={{ uri: item.url }} style={styles.sticker} />
            </Animated.View>
        </TouchableOpacity>
    );

    return (
        <Animated.View
            style={
                [animatedStyle, styles.container, { minHeight: heightContainer }]
            }
            key={windowState.active}
            entering={FadeInDown.springify().withCallback(() => runOnJS(setWindowLoaded)(true))}
            exiting={FadeOutDown.springify()}
        >
            <Animated.View
                style={styles.friendsContainer} onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    friendsContainer.value = height
                }}
            >
                {markerState.new?.policy.isPrivate === true && !isStickersOpen &&
                    <View style={{ padding: 10 }}>
                        <Animated.View style={{
                            backgroundColor: THEME.colors.grayscale.lighter_x1,
                            borderRadius: 10, flexDirection: "column", gap: 10, paddingVertical: 10
                        }} entering={FadeInUp.springify().damping(17)} exiting={FadeOut}>
                            <Text style={{ fontSize: 16, color: THEME.colors.primary, paddingHorizontal: 10 }}>Pick some friends</Text>
                            <FlatList
                                data={user?.friends}
                                horizontal={true}
                                keyExtractor={(user: IUser) => user.userId.toString()}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item: user }) => (
                                    <UserItem user={user} />
                                )}
                            />
                        </Animated.View>
                    </View>
                }
            </Animated.View>
            <View style={{ position: "absolute", padding: 10, bottom: 0 }} onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setHeightContainer(height)
            }}>
                {
                    isStickersOpen ?
                        <View style={styles.stickerContainer}>
                            <FlatList
                                contentContainerStyle={{ alignItems: 'center' }}
                                data={stickers}
                                renderItem={renderSticker}
                                keyExtractor={(item) => item.name}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>
                        :
                        <View style={styles.accessSettingContainer}>
                            <Animated.View key={isStickersOpen.toString()} exiting={FadeOut.springify()} style={{ width: '100%', flexDirection: 'row', }}>
                                <View style={styles.textContainer}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: THEME.colors.primary, marginBottom: 10 }}>Viewer Access</Text>
                                    <Text style={{ color: 'gray', marginBottom: 2 }}>Who can see this marker?</Text>
                                </View>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.optionButton,
                                            markerState.new?.policy.isPrivate === false && styles.selectedOption,
                                        ]}
                                        onPress={() => updateNewMarker({
                                            policy: {
                                                isPrivate: false,
                                                show: markerState.new?.policy.show || []
                                            }
                                        })}
                                    >
                                        <Ionicons
                                            name="globe-outline"
                                            size={16}
                                            color={THEME.colors.primary}
                                        />
                                        {markerState.new?.policy.isPrivate === false && <Text style={styles.optionText}>Everyone</Text>}
                                    </TouchableOpacity>
                                    {
                                        user?.friends.length && user?.friends.length > 0 ? <TouchableOpacity
                                            disabled={!windowState.isLoaded}
                                            style={[
                                                styles.optionButton,
                                                markerState.new?.policy.isPrivate === true && styles.selectedOption,
                                            ]}
                                            onPress={() => updateNewMarker({
                                                policy: {
                                                    isPrivate: true,
                                                    show: markerState.new?.policy.show || []
                                                }
                                            })}
                                        >
                                            {
                                                windowState.isLoaded ?
                                                    <MaterialIcons
                                                        name="group"
                                                        size={16}
                                                        color={THEME.colors.primary}
                                                    /> :
                                                    <ActivityIndicator size={16} />
                                            }

                                            {markerState.new?.policy.isPrivate === true && <Text style={styles.optionText}>Friends</Text>}
                                        </TouchableOpacity> : undefined
                                    }
                                    <View />
                                </View>
                            </Animated.View>
                        </View>
                }
                <View style={styles.column}>
                    <TouchableOpacity onPress={() => setIsStickersOpen(!isStickersOpen)} style={styles.iconContainer}>
                        <Animated.View key={markerState.new?.icon} entering={ZoomInEasyDown} exiting={ZoomOutEasyUp}>
                            <Image source={{ uri: markerState.new?.icon }} style={styles.sticker} />
                        </Animated.View>
                    </TouchableOpacity>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            maxLength={INPUT.max_length.first_message}
                            placeholder="Say something..."
                            value={inputValue}
                            onChangeText={(e) => {
                                setInputValue(e)
                                updateNewMarker({ label: e })
                            }
                            }
                        />
                        <View style={styles.characterCountContainer}>
                            <Text style={[styles.characterCountText, { color: inputValue.length < 25 ? '#B0B0B0' : 'rgba(255,87,51,0.5)' }]}>{inputValue.length}/ {INPUT.max_length.first_message}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.sendContainer}
                        onPress={addNewMarker}
                        disabled={markerState.new?.policy.isPrivate === true && selectedFriends.length === 0}
                    >
                        <MaterialCommunityIcons
                            name="send-circle"
                            size={35}
                            color={
                                markerState.new?.policy.isPrivate === true && selectedFriends.length === 0
                                    ? THEME.colors.grayscale.darker_x1
                                    : THEME.colors.primary
                            }
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View >
    )
}

export default NewMarker

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.main,
        borderRadius: 20,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: "relative",
    },
    accessSettingContainer: {
        overflow: 'hidden',
        flexDirection: 'row',
        height: 70,
        width: '100%',
        backgroundColor: THEME.colors.grayscale.lighter_x1,
        borderRadius: 10,
        padding: 10,
    },
    stickerContainer: {
        flexDirection: 'row',
        height: 70,
        width: '100%',
        backgroundColor: THEME.colors.grayscale.lighter_x1,
        borderRadius: 10
    },
    column: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    buttonContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 4
    },
    textContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flex: 5
    },
    optionButton: {
        height: 35,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 2,
        borderRadius: 10,
        backgroundColor: THEME.colors.grayscale.darker_x1,
    },
    participantControlContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    participantSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        gap: 10,
    },
    incrementButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: THEME.colors.grayscale.darker_x1,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    incrementText: {
        fontSize: 20,
        color: THEME.colors.primary,
        fontWeight: 'bold',
    },
    participantInput: {
        width: 60,
        height: 40,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: THEME.colors.primary,
        borderRadius: 10,
        backgroundColor: THEME.colors.grayscale.main,
        color: THEME.colors.primary,
    },
    selectedOption: {
        backgroundColor: THEME.colors.accent,
    },
    optionText: {
        marginLeft: 5,
        color: THEME.colors.primary,
    },
    selectedText: {
        color: THEME.colors.text.black,
        fontWeight: 'bold',
    },
    iconContainer: {
        overflow: 'hidden',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.darker_x1,
        borderRadius: 10,
        marginTop: 10,
    },
    inputContainer: {
        flex: 6,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.darker_x1,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 40,
        marginTop: 20,
    },
    input: {
        flex: 1,
        paddingVertical: 8,
    },
    characterCountContainer: {
        padding: 4,
        width: 55,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    characterCountText: {
        fontSize: 14,
    },
    sendContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    friendsContainer: {
        width: '100%',
    },
    flatListItem: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        width: 50,
    },
    accountIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.colors.grayscale.darker_x1
    },
    accountIconText: {
        color: THEME.colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    selectedFriend: {
        backgroundColor: THEME.colors.accent, // Couleur de fond pour l'ami sélectionné
        borderColor: THEME.colors.primary,
        borderWidth: 2,
    },
    selectedFriendText: {
        color: THEME.colors.text.black, // Couleur du texte pour l'ami sélectionné
        fontWeight: 'bold',
    },
    sticker: {
        width: 60,
        height: 50,
    },
});
