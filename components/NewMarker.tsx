import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import Animated, { FadeInDown, FadeInUp, FadeOut, FadeOutDown, runOnJS, useAnimatedStyle, useSharedValue, withSpring, ZoomInEasyDown, ZoomInEasyUp, ZoomOutDown, ZoomOutEasyDown, ZoomOutEasyUp } from 'react-native-reanimated'
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { INPUT, THEME } from '~/constants/constants'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useAuth } from '~/contexts/AuthProvider'
import { useWindow } from '~/contexts/window/Context'
import { useMarker } from '~/contexts/marker/Context'
import { Image } from 'expo-image';
import StickersList from './stickers/List'
import FriendsList from './friends/List'

interface NewMarkerProps { }


const NewMarker: React.FC<NewMarkerProps> = () => {

    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [damplingValue, setDamplingValue] = useState<number>(100);
    const [heightContainer, setHeightContainer] = useState(0)
    const [isStickersOpen, setIsStickersOpen] = useState<boolean>(false)

    const { user } = useAuth();
    const { state: windowState, setLoaded: setWindowLoaded } = useWindow()
    const { state: markerState, updateNew: updateNewMarker, addNew: addNewMarker } = useMarker()

    const friendsContainer = useSharedValue(0)

    const animatedStyle = useAnimatedStyle(() => ({
        height: windowState.isLoaded ? withSpring(heightContainer + friendsContainer.value, { damping: damplingValue }, (finished) => {
            finished && runOnJS(setDamplingValue)(14)
        }) : undefined
    }));

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
                            <FriendsList selected={selectedFriends} setSelected={setSelectedFriends} />
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
                            <StickersList />
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
                            value={markerState.new?.label}
                            onChangeText={(e) => {
                                updateNewMarker({ label: e })
                            }
                            }
                        />
                        <View style={styles.characterCountContainer}>
                            <Text style={[styles.characterCountText, { color: markerState.new?.label.length && markerState.new?.label.length >= 25 ? 'rgba(255,87,51,0.5)' : '#B0B0B0' }]}>{markerState.new?.label.length}/ {INPUT.max_length.first_message}</Text>
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
    sticker: {
        width: 60,
        height: 50,
    },
});
