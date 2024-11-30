import { ActivityIndicator, FlatList, LayoutChangeEvent, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, interpolateColor, runOnJS, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withTiming, ZoomInEasyDown, LinearTransition, withSpring, SlideInUp, FadeOutUp } from 'react-native-reanimated'
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { INPUT, THEME } from '~/constants/constants'
import { useMap } from '~/contexts/MapProvider'
import { WindowType } from '~/contexts/window/types'
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { IUser } from '~/types/UserInterfaces'
import { useAuth } from '~/contexts/AuthProvider'
import { IMarker } from '~/types/MarkerInterfaces'
import { useWindow } from '~/contexts/window/Context'

enum Selector {
    EVERYONE = 'everyone',
    FRIENDS = 'friends',
}

interface NewMarkerProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}


const NewMarker: React.FC<NewMarkerProps> = () => {

    const [inputValue, setInputValue] = useState<string>('')
    const [selectedOption, setSelectedOption] = useState<Selector>(Selector.EVERYONE)
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [damplingValue, setDamplingValue] = useState<number>(100);

    const { newMarker, addMarker } = useMap();
    const { user } = useAuth();
    const { state } = useWindow()

    const friendsContainer = useSharedValue(0)
    const [heightContainer, setHeightContainer] = useState(0)
    const [isComponentLoaded, setIsComponentLoaded] = useState<boolean>(false)

    const handleFriendSelect = (friendId: string) => {
        setSelectedFriends((prev) =>
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    // const animatedStyle = useAnimatedStyle(() => {
    //     return {
    //         height: selectedOption === Selector.FRIENDS ? withSpring(275, { damping: 17 }) : withSpring(150, { damping: 17 })
    //     };
    // });


    // Style animé
    const animatedStyle = useAnimatedStyle(() => ({
        height: isComponentLoaded ? withSpring(heightContainer + friendsContainer.value, { damping: damplingValue }, (finished) => {
            finished && runOnJS(setDamplingValue)(14)
        }) : undefined
    }));


    const submitMarker = async () => {
        if (newMarker) {
            await addMarker({
                ...newMarker,
                label: inputValue,
                minZoom: 15,
                policy: {
                    isPrivate: selectedOption === Selector.EVERYONE ? false : true,
                    show: selectedOption === Selector.EVERYONE
                        ? []
                        : (selectedFriends.length > 0 ? [...selectedFriends, user?.userId!] : [])
                },
                subscribedUserIds: [],
                connectedUserIds: [],
                createdAt: new Date().getTime(),
                senderId: user?.userId!,
            } as IMarker);
            setInputValue('');
            setSelectedFriends([]);
        }
    };

    const UserItem: React.FC<{ user: IUser }> = ({ user }) => {
        const isSelected = selectedFriends.includes(user.userId);

        return (
            <View style={styles.flatListItem}>
                <TouchableWithoutFeedback
                    style={[styles.accountIconContainer, isSelected && styles.selectedFriend]}
                    onPress={() => handleFriendSelect(user.userId)}
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

    return (
        <Animated.View style={[animatedStyle, styles.container, { minHeight: heightContainer }]} key={state.activeWindow} entering={FadeInDown.springify().withCallback(() => runOnJS(setIsComponentLoaded)(true))} exiting={FadeOutDown.springify()}>
            <Animated.View
                style={styles.friendsContainer} onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    friendsContainer.value = height
                }}
            >
                {selectedOption === Selector.FRIENDS &&
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
                <View style={styles.accessSettingContainer}>
                    <View style={styles.textContainer}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: THEME.colors.primary, marginBottom: 10 }}>Viewer Access</Text>
                        <Text style={{ color: 'gray', marginBottom: 2 }}>Who can see this marker?</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.optionButton, selectedOption === Selector.EVERYONE && styles.selectedOption]}
                            onPress={() => setSelectedOption(Selector.EVERYONE)}
                        >
                            <Ionicons
                                name="globe-outline"
                                size={16}
                                color={THEME.colors.primary}
                            />
                            {selectedOption === Selector.EVERYONE && <Text style={styles.optionText}>Everyone</Text>}
                        </TouchableOpacity>
                        {
                            user?.friends.length && user?.friends.length > 0 ? <TouchableOpacity
                                disabled={isComponentLoaded === false}
                                style={[styles.optionButton, selectedOption === Selector.FRIENDS && styles.selectedOption]}
                                onPress={() => setSelectedOption(Selector.FRIENDS)}
                            >
                                {
                                    isComponentLoaded ?
                                        <MaterialIcons
                                            name="group"
                                            size={16}
                                            color={THEME.colors.primary}
                                        /> :
                                        <ActivityIndicator size={16} />
                                }

                                {selectedOption === Selector.FRIENDS && <Text style={styles.optionText}>Friends</Text>}
                            </TouchableOpacity> : <></>
                        }

                        <View />
                    </View>
                </View>
                <View style={styles.column}>
                    <View style={styles.iconContainer}>

                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            maxLength={INPUT.max_length.first_message}
                            placeholder="Say something..."
                            value={inputValue}
                            onChangeText={setInputValue}
                        />
                        <View style={styles.characterCountContainer}>
                            <Text style={[styles.characterCountText, { color: inputValue.length < 25 ? '#B0B0B0' : 'rgba(255,87,51,0.5)' }]}>{inputValue.length}/ {INPUT.max_length.first_message}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.sendContainer}
                        onPress={submitMarker}
                        disabled={selectedOption === Selector.FRIENDS && selectedFriends.length === 0}
                    >
                        <MaterialCommunityIcons
                            name="send-circle"
                            size={35}
                            color={
                                selectedOption === Selector.FRIENDS && selectedFriends.length === 0
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: THEME.colors.grayscale.lighter_x1,
        borderRadius: 10,
        padding: 10,
    },
    column: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    buttonContainer: {
        flex: 5,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    textContainer: {
        flex: 5,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    optionButton: {
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.darker_x1,
        borderRadius: 10,
        padding: 10,
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
});
