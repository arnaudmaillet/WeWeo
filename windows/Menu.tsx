import { StyleSheet, TextInput, View, Text, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Animated, { ZoomIn, FadeInDown, FadeOutDown, runOnJS, FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated'
import { FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { THEME } from '~/constants/constants';
import { useWindow } from '~/contexts/windows/Context';
import { useMarker } from '~/contexts/markers/Context';
import { useUser } from '~/contexts/user/Context';
import { IFriend } from '~/contexts/user/types';
import { useMenu } from '~/contexts/menu/Context';
import { FlatList, Gesture, GestureDetector, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { MenuType } from '~/contexts/menu/types';
import { WindowType } from '~/contexts/windows/types';
import TextSquare from '~/components/TextSquare';

interface MenuWindowProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}

const MenuWindow: React.FC<MenuWindowProps> = ({ onFocusInput, onBlurInput }) => {
    const [searchContent, setSearchContent] = React.useState<string>('')

    const { user } = useUser()
    const { menu, setMenu } = useMenu()
    const { window, setActive: setActiveWindow, setLoaded: setWindowLoaded } = useWindow()
    const { setFiltered, setActive: setActiveMarker } = useMarker()
    const [friends, setFriends] = useState<IFriend[]>([])
    const [buttonPressedEvent, setButtonPressedEvent] = useState<boolean>(false)

    const containerHeight = useSharedValue(0);
    const ellipsisOpacity = useSharedValue(0);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        height: containerHeight.value
    }));

    const animatedEllipsisStyle = useAnimatedStyle(() => ({
        opacity: ellipsisOpacity.value
    }));

    const maxHeight = 500;

    const pan = Gesture.Pan()
        .onStart(() => {
            containerHeight.value = containerHeight.value || 0;
        })
        .onChange((event) => {
            const newHeight = Math.min(maxHeight, Math.max(0, containerHeight.value - event.changeY));
            const newOpacity = newHeight / maxHeight;

            containerHeight.value = newHeight;
            ellipsisOpacity.value = newOpacity
        })
        .onEnd(() => {
            if (containerHeight.value > maxHeight / 2) {
                containerHeight.value = withSpring(maxHeight, {
                    duration: 2000,
                    dampingRatio: 0.5,
                })
                ellipsisOpacity.value = withTiming(maxHeight)
            } else {
                containerHeight.value = withTiming(0);
                ellipsisOpacity.value = withTiming(0);
                runOnJS(setButtonPressedEvent)(false)
            }
        });


    useEffect(() => {
        if (!user?.friends) return;
        if (friends.length > 0) {
            const filteredFriends = user?.friends
                .filter(friend => friends.includes(friend))
                .flatMap(friend => friend.ownerOf);
            setFiltered(filteredFriends);
        } else {
            setFiltered(undefined)
        }

    }, [friends]);

    useEffect(() => {
        if (menu.active === MenuType.HISTORY) {
            if (buttonPressedEvent) {
                containerHeight.value = withSpring(maxHeight, {
                    damping: 15,
                    stiffness: 120,
                });
                ellipsisOpacity.value = withTiming(1, { duration: 300 });
            } else {
                containerHeight.value = withTiming(0);
                ellipsisOpacity.value = withTiming(0)
            }
        } else {
            containerHeight.value = withTiming(0);
            ellipsisOpacity.value = withTiming(0);
            setButtonPressedEvent(false)
        }
    }, [buttonPressedEvent])

    const isTyping = searchContent !== '';

    return (
        <Animated.View
            key={window.active}
            style={styles.container}
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify().withCallback(() => runOnJS(setWindowLoaded)(true))}
        >
            <View style={styles.row}>
                {/* {
                    window.menu === MenuType.FRIENDS && <View>
                        <FriendsList selected={friends} setSelected={setFriends} style={{ paddingHorizontal: 15 }} />
                    </View>
                } */}
                <GestureDetector gesture={pan}>
                    <Animated.View style={[animatedContainerStyle, { marginHorizontal: 16, gap: 8 }]}>
                        <Animated.View style={[animatedEllipsisStyle, styles.ellipsis]}>
                            <FontAwesome6 name="ellipsis" size={20} color={THEME.colors.grayscale.darker_3x} />
                        </Animated.View>
                        <Text style={{ color: 'gray', fontSize: 24, fontWeight: 'bold', paddingLeft: 8 }}>History</Text>
                        <FlatList

                            style={{ flex: 1, marginBottom: 16 }}
                            data={user?.history?.slice().reverse()}
                            renderItem={({ item }) => {
                                const viewedAtDate = new Date(item.viewedAt);
                                const formattedDate = viewedAtDate.toLocaleString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                });
                                return (
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 4 }} onPress={() => {
                                        setActiveMarker(item)
                                        setActiveWindow(WindowType.CHAT)
                                    }}>
                                        <View style={{ height: 42, width: 42, backgroundColor: THEME.colors.grayscale.darker_1x, padding: 2, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
                                            {
                                                item.icon ? <Image source={{ uri: item.icon }} style={{ height: 40, width: 40 }} contentFit='contain' /> : <MaterialCommunityIcons name="set-none" size={24} color={THEME.colors.grayscale.darker_3x} />
                                            }
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ flex: 1, color: 'grey' }}>{item.label}</Text>
                                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <FontAwesome6 name="location-dot" size={12} color={THEME.colors.grayscale.darker_3x} />
                                                <Text style={{ flex: 1, color: 'grey', fontSize: 8 }}>2774 Livermore Outlets Dr, Livermore, CA 94551, États-Unis</Text>
                                            </View>
                                        </View>
                                        <View style={{
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{ color: 'grey', fontSize: 11 }}>{formattedDate}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    </Animated.View>
                </GestureDetector>
                <View style={{ gap: 16 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 15 }}>
                        <View style={styles.userIconContainer}>
                            <TouchableOpacity onPress={() => { }}>
                                <Ionicons name="person-circle-outline" size={30} color="#D3D3D3" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <Ionicons name="search-outline" size={20} color={THEME.colors.grayscale.darker_3x} style={styles.searchIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Type to search..."
                                value={searchContent}
                                onChangeText={setSearchContent}
                                onFocus={onFocusInput}
                                onBlur={onBlurInput}
                            />

                            <Animated.View style={styles.animatedIcon} key={isTyping.toString()} entering={ZoomIn.springify()}>
                                <TouchableOpacity onPress={() => {
                                    isTyping ? setSearchContent('') : console.log('Voice search')
                                }} style={styles.sendButton}>
                                    {isTyping ? (
                                        <MaterialIcons name="cancel" size={20} color={THEME.colors.grayscale.darker_3x} />
                                    ) : (
                                        <FontAwesome6 name="microphone" size={18} color={THEME.colors.grayscale.darker_3x} />
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        {
                            menu.buttons.map(button => (
                                <View style={styles.button} key={button.type}>
                                    <TouchableOpacity onPress={() => {
                                        setMenu(button.type)
                                        setButtonPressedEvent(!buttonPressedEvent)
                                    }}>
                                        <View style={styles.buttonIcon}>
                                            {
                                                button.isLoading ?
                                                    <ActivityIndicator color={THEME.colors.primary} /> :
                                                    React.cloneElement(button.icon, {
                                                        color: menu.active === button.type ? button.activeColor : button.color
                                                    })
                                            }
                                        </View>
                                        <Text style={[{ color: menu.active === button.type ? button.activeColor : button.color }, styles.buttonMenu]}>{button.label}</Text>
                                        <Animated.View key={menu.active} entering={FadeIn.springify().duration(1000)} exiting={FadeOut.springify()} style={styles.buttonIndicatorContainer} >
                                            {menu.active === button.type && <View style={[styles.buttonIndicator, { backgroundColor: button.activeColor }]}></View>}
                                        </Animated.View>
                                    </TouchableOpacity>
                                </View>
                            ))
                        }
                    </View>
                </View>
            </View>
        </Animated.View >
    )
}

export default MenuWindow

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: THEME.colors.grayscale.main,
        paddingVertical: 12,
        borderRadius: 32,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: .4,
        shadowRadius: 16,
        elevation: 10,
    },
    row: {
        flex: 1,
    },
    userIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.darker_1x,
        borderRadius: 16,
        paddingHorizontal: 8,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 8,
    },
    animatedIcon: {
        padding: 4,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        flex: 1,
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonMenu: {
        fontSize: 10
    },
    buttonIcon: {
        alignItems: 'center'
    },
    buttonIndicatorContainer: {
        height: 4,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    buttonIndicator: {
        height: 2,
        width: 20,
        borderRadius: 8,
        opacity: .5
    },
    ellipsis: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        top: -15,
        left: '50%',
        transform: [{ translateX: -25 }],
        width: 50
    }
});
