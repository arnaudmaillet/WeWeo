import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeOut,
    FadeOutDown,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    ZoomInEasyDown,
    ZoomOutEasyUp,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { INPUT, THEME } from '~/constants/constants';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useAuth } from '~/contexts/AuthProvider';
import { useWindow } from '~/contexts/windows/Context';
import { useMarker } from '~/contexts/markers/Context';
import { Image } from 'expo-image';
import StickersList from '~/components/stickers/List';
import FriendsList from '~/components/friends/List';

interface NewMarkerWindowProps { }

const NewMarkerWindow: React.FC<NewMarkerWindowProps> = () => {
    const [heightContainer, setHeightContainer] = useState(0);
    const [damplingValue, setDamplingValue] = useState<number>(100);
    const [isStickersOpen, setIsStickersOpen] = useState<boolean>(false);
    const [canFriendsDisplayed, setCanFriendsDisplayed] = useState<boolean>(false) // equivalent to windowState.isLoaded but this one works idkw

    const { user } = useAuth();
    const { state: windowState, setLoaded: setWindowLoaded } = useWindow();
    const { state: markerState, updateNew: updateNewMarker, firestoreAdd: addNewMarker, } = useMarker();

    const friendsContainer = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        height: windowState.isLoaded
            ? withSpring(heightContainer + friendsContainer.value, { damping: damplingValue }, (finished) => {
                if (finished) {
                    runOnJS(setDamplingValue)(14)
                    runOnJS(setCanFriendsDisplayed)(true)
                }
            }) : undefined
    }));

    const handleUpdateFriends = (friendsIds: string[]) => {
        updateNewMarker({
            policy: {
                isPrivate: markerState.new?.policy.isPrivate || true,
                show: friendsIds
            }
        })
    }

    return (
        <Animated.View
            style={[animatedStyle, styles.container, { minHeight: heightContainer }]}
            key={windowState.active}
            entering={FadeInDown.springify().withCallback(() => runOnJS(setWindowLoaded)(true))}
            exiting={FadeOutDown.springify()}
        >
            <Animated.View
                style={styles.friendsListContainer}
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    friendsContainer.value = height;
                }}
            >
                {markerState.new?.policy.isPrivate === true && !isStickersOpen && canFriendsDisplayed && (
                    <View style={styles.friendsPickerWrapper}>
                        <Animated.View
                            style={styles.friendsPickerContent}
                            entering={FadeInUp.springify().damping(17)}
                            exiting={FadeOut}
                        >
                            <Text style={styles.friendsPickerText}>Pick some friends</Text>
                            {/* <FriendsList selected={markerState.new.policy.show} setSelected={handleUpdateFriends} /> */}
                        </Animated.View>
                    </View>
                )}
            </Animated.View>
            <View
                style={styles.bottomControlsContainer}
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setHeightContainer(height);
                }}
            >
                {isStickersOpen ? (
                    <View style={styles.stickerSelectionWrapper}>
                        <StickersList isHorizontal={true} onClickItem={(url) => updateNewMarker({ icon: url })} />
                    </View>
                ) : (
                    <View style={styles.accessSettingsWrapper}>
                        <Animated.View key={isStickersOpen.toString()} exiting={FadeOut.springify()} style={styles.fullRow}>
                            <View style={styles.accessTextWrapper}>
                                <Text style={styles.accessTitle}>Viewer Access</Text>
                                <Text style={styles.accessSubtitle}>Who can see this marker?</Text>
                            </View>
                            <View style={styles.accessButtonGroup}>
                                <TouchableOpacity
                                    style={[
                                        styles.accessButton,
                                        markerState.new?.policy.isPrivate === false && styles.selectedAccessButton,
                                    ]}
                                    onPress={() =>
                                        updateNewMarker({
                                            policy: {
                                                isPrivate: false,
                                                show: markerState.new?.policy.show || [],
                                            },
                                        })
                                    }
                                >
                                    <Ionicons name="globe-outline" size={16} color={THEME.colors.primary} />
                                    {markerState.new?.policy.isPrivate === false && (
                                        <Text style={styles.accessButtonText}>Everyone</Text>
                                    )}
                                </TouchableOpacity>
                                {user?.friends.length && user?.friends.length > 0 ? (
                                    <TouchableOpacity
                                        disabled={!windowState.isLoaded}
                                        style={[
                                            styles.accessButton,
                                            markerState.new?.policy.isPrivate === true && styles.selectedAccessButton,
                                        ]}
                                        onPress={() =>
                                            updateNewMarker({
                                                policy: {
                                                    isPrivate: true,
                                                    show: markerState.new?.policy.show || [],
                                                },
                                            })
                                        }
                                    >
                                        {windowState.isLoaded ? (
                                            <MaterialIcons name="group" size={16} color={THEME.colors.primary} />
                                        ) : (
                                            <ActivityIndicator size={16} />
                                        )}
                                        {markerState.new?.policy.isPrivate === true && (
                                            <Text style={styles.accessButtonText}>Friends</Text>
                                        )}
                                    </TouchableOpacity>
                                ) : undefined}
                            </View>
                        </Animated.View>
                    </View>
                )}
                <View style={styles.markerControls}>
                    <TouchableOpacity
                        onPress={() => setIsStickersOpen(!isStickersOpen)}
                        style={styles.iconWrapper}
                    >
                        <Animated.View
                            key={markerState.new?.icon}
                            entering={windowState.isLoaded ? ZoomInEasyDown : undefined}
                            exiting={ZoomOutEasyUp}
                        >
                            <Image source={{ uri: markerState.new?.icon }} style={styles.stickerPreview} contentFit='contain' />
                        </Animated.View>
                    </TouchableOpacity>
                    <View style={styles.messageInputWrapper}>
                        <TextInput
                            style={styles.messageInput}
                            maxLength={INPUT.max_length.first_message}
                            placeholder="Say something..."
                            value={markerState.new?.label}
                            onChangeText={(e) => updateNewMarker({ label: e })}
                        />
                        <View style={styles.characterCountWrapper}>
                            <Text
                                style={[
                                    styles.characterCountText,
                                    {
                                        color:
                                            markerState.new?.label.length &&
                                                markerState.new?.label.length >= 25
                                                ? 'rgba(255,87,51,0.5)'
                                                : '#B0B0B0',
                                    },
                                ]}
                            >
                                {markerState.new?.label.length}/ {INPUT.max_length.first_message}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.sendButtonWrapper}
                        onPress={addNewMarker}
                        disabled={markerState.new?.policy.isPrivate === true && markerState.new.policy.show.length === 0}
                    >
                        <MaterialCommunityIcons
                            name="send-circle"
                            size={35}
                            color={
                                markerState.new?.policy.isPrivate === true && markerState.new.policy.show.length === 0
                                    ? THEME.colors.grayscale.darker_1x
                                    : THEME.colors.primary
                            }
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

export default NewMarkerWindow;


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
        position: 'relative',
    },
    friendsListContainer: {
        width: '100%',
    },
    friendsPickerWrapper: {
        padding: 10,
    },
    friendsPickerContent: {
        borderRadius: 10,
        flexDirection: 'column',
        gap: 10,
        paddingVertical: 10,
    },
    friendsPickerText: {
        fontSize: 16,
        color: THEME.colors.primary,
        paddingHorizontal: 10,
    },
    bottomControlsContainer: {
        position: 'absolute',
        padding: 10,
        bottom: 0,
    },
    stickerSelectionWrapper: {
        flexDirection: 'row',
        height: 70,
        width: '100%',
        backgroundColor: THEME.colors.grayscale.lighter_1x,
        borderRadius: 10,
    },
    accessSettingsWrapper: {
        overflow: 'hidden',
        flexDirection: 'row',
        height: 70,
        width: '100%',
        backgroundColor: THEME.colors.grayscale.lighter_1x,
        borderRadius: 10,
        padding: 10,
    },
    fullRow: {
        width: '100%',
        flexDirection: 'row',
    },
    accessTextWrapper: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flex: 5,
    },
    accessTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: THEME.colors.primary,
        marginBottom: 10,
    },
    accessSubtitle: {
        color: 'gray',
        marginBottom: 2,
    },
    accessButtonGroup: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flex: 4,
    },
    accessButton: {
        height: 35,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 2,
        borderRadius: 10,
        backgroundColor: THEME.colors.grayscale.darker_1x,
    },
    selectedAccessButton: {
        backgroundColor: THEME.colors.accent,
    },
    accessButtonText: {
        marginLeft: 5,
        color: THEME.colors.primary,
    },
    markerControls: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    iconWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.darker_1x,
        borderRadius: 10,
        marginTop: 10,
        overflow: 'hidden'
    },
    stickerPreview: {
        width: 60,
        height: 50,
    },
    messageInputWrapper: {
        flex: 6,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.darker_1x,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 40,
        marginTop: 20,
    },
    messageInput: {
        flex: 1,
        paddingVertical: 8,
    },
    characterCountWrapper: {
        padding: 4,
        width: 55,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    characterCountText: {
        fontSize: 14,
    },
    sendButtonWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});

