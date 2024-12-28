import { View, Text, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import Animated, { ZoomIn, FadeInDown, FadeOutDown, runOnJS, FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming, withSpring, ZoomOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { THEME } from '~/constants/constants';
import { useWindow } from '~/contexts/windows/Context';
import { useMarker } from '~/contexts/markers/Context';
import { useUser } from '~/contexts/user/Context';
import { IFriend } from '~/contexts/user/types';
import { useMenu } from '~/contexts/menu/Context';
import { FlatList, Gesture, GestureDetector, TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { MenuType } from '~/contexts/menu/types';
import FriendsList from '~/components/friends/List';

interface MenuWindowProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}

const MenuWindow: React.FC<MenuWindowProps> = ({ onFocusInput, onBlurInput }) => {
    const [searchContent, setSearchContent] = React.useState<string>('')

    const { user } = useUser()
    const { menu, setMenu, setOpen } = useMenu()
    const { window, setActive: setActiveWindow, setLoaded: setWindowLoaded } = useWindow()
    const { state: markerState, setFiltered, setPreview: setPreviewMarker, firestoreFetch: firestoreFetchMarkers } = useMarker()
    const [friends, setFriends] = useState<IFriend[]>([])
    const [buttonPressedEvent, setButtonPressedEvent] = useState<boolean>(false)
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);

    const containerHeight = useSharedValue(0);
    const containerOpacity = useSharedValue(0);
    const screenDimensions = Dimensions.get('window');
    let index = 0

    const animatedContainerStyle = useAnimatedStyle(() => ({
        height: containerHeight.value,
        opacity: containerOpacity.value
    }));

    const FRIENDS_CONTAINER_HEIGHT = 70
    const HISTORY_CONTAINER_HEIGHT = 65;
    const HISTORY_ITEM_WIDTH = 50;

    // const pan = Gesture.Pan()
    //     .onStart(() => {
    //         containerHeight.value = containerHeight.value || 0;
    //         containerOpacity.value = containerOpacity.value || 0;
    //     })
    //     .onChange((event) => {
    //         const newHeight = Math.min(HISTORY_CONTAINER_HEIGHT, Math.max(0, containerHeight.value - event.changeY));
    //         const newOpacity = newHeight / HISTORY_CONTAINER_HEIGHT;

    //         containerHeight.value = newHeight;
    //         containerOpacity.value = newOpacity
    //     })
    //     .onEnd(() => {
    //         if (containerHeight.value > HISTORY_CONTAINER_HEIGHT / 2) {
    //             containerHeight.value = withSpring(HISTORY_CONTAINER_HEIGHT, {
    //                 duration: 2000,
    //                 dampingRatio: 0.5,
    //             })
    //             containerHeight
    //         } else {
    //             containerOpacity.value = 0
    //             containerHeight.value = withTiming(0);
    //             runOnJS(setButtonPressedEvent)(false)
    //         }
    //     });

    useEffect(() => {
        setPreviewMarker(user?.history?.slice().reverse()[index] || null)
        console.log(user?.history?.slice().reverse()[index])
    }, [])

    useEffect(() => {
        // console.log(markerState.preview)
    }, [markerState.preview])


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
            if (menu.isOpen) {
                containerHeight.value = withSpring(HISTORY_CONTAINER_HEIGHT, {
                    damping: 15,
                    stiffness: 120,
                });
                containerOpacity.value = withTiming(1, { duration: 300 })
            } else {
                containerOpacity.value = withTiming(0, { duration: 150 })
                containerHeight.value = withTiming(0);
            }
        } else if (menu.active === MenuType.FRIENDS) {
            if (menu.isOpen) {
                containerHeight.value = withSpring(FRIENDS_CONTAINER_HEIGHT, {
                    damping: 15,
                    stiffness: 120,
                });
                containerOpacity.value = withTiming(1, { duration: 300 })
            } else {
                containerOpacity.value = withTiming(0, { duration: 150 })
                containerHeight.value = withTiming(0);
            }
        } else {
            containerOpacity.value = withTiming(0, { duration: 150 })
            containerHeight.value = withTiming(0);
            setButtonPressedEvent(false)
        }
    }, [buttonPressedEvent])


    return (
        <Animated.View
            key={window.active}
            className="bg-grayscale py-3 rounded-3xl shadow-lg"
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify().withCallback(() => runOnJS(setWindowLoaded)(true))}
        >

            <Animated.View key={menu.active} style={animatedContainerStyle} entering={FadeIn.springify().delay(300)} exiting={FadeOut.springify().duration(300)}>
                {
                    menu.active === MenuType.FRIENDS &&
                    <View className='mb-4'>
                        <FriendsList selected={friends} setSelected={setFriends} style={{ paddingHorizontal: 15 }} />
                    </View>
                }
                {
                    menu.active === MenuType.HISTORY &&
                    <View className='mb-4 mx-5'>
                        <View className='bg-primary/75 h-[2] w-[20] ml-[15] rounded-xl'></View>
                        <FlatList
                            data={user?.history?.slice().reverse()}
                            contentContainerStyle={{ alignItems: 'center' }}
                            horizontal
                            className='h-[50]'
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            snapToInterval={HISTORY_ITEM_WIDTH}
                            decelerationRate="fast"
                            getItemLayout={(data, index) => ({
                                length: HISTORY_ITEM_WIDTH,
                                offset: HISTORY_ITEM_WIDTH * index,
                                index,
                            })}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={{
                                        width: HISTORY_ITEM_WIDTH,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <View className={`h-[46] w-[46] bg-grayscale-darker_1x justify-center items-center rounded-xl`}>
                                        {item.icon ? (
                                            <Image source={{ uri: item.icon }} style={{ height: 40, width: 40 }} contentFit="contain" />
                                        ) : (
                                            <MaterialCommunityIcons name="set-none" size={24} color={THEME.colors.grayscale.darker_3x} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                            onMomentumScrollEnd={(event) => {
                                index = Math.floor(event.nativeEvent.contentOffset.x / HISTORY_ITEM_WIDTH)
                                setSelectedHistoryIndex(index)
                                setPreviewMarker(user?.history?.slice().reverse()[index] || null)
                                console.log(index)
                            }}
                            ListFooterComponent={() => (
                                <View
                                    style={{
                                        width: (screenDimensions.width - HISTORY_ITEM_WIDTH) - (HISTORY_ITEM_WIDTH + 10),
                                    }}
                                />
                            )}
                        />
                        <View className='bg-primary/75 h-[2] w-[20] ml-[15] rounded-xl'></View>
                    </View>
                }
            </Animated.View>
            <View className='flex-row'>
                {
                    menu.buttons.map(button => (
                        <View className='items-center flex-1' key={button.type}>
                            <TouchableOpacity onPress={() => {
                                if (menu.active === button.type) {
                                    setOpen(!menu.isOpen)
                                } else if (button.type === MenuType.HISTORY) {
                                    setOpen(true)
                                    setMenu(button.type)
                                } else if (button.type === MenuType.FRIENDS) {
                                    setOpen(true)
                                    setMenu(button.type)
                                } else {
                                    setMenu(button.type)
                                }
                                setButtonPressedEvent(!buttonPressedEvent)
                            }} onLongPress={() => menu.active === button.type && firestoreFetchMarkers(button.type)}>
                                <Animated.View className='h-[25] items-center justify-center' key={button.isLoading.toString()} entering={ZoomIn.springify()} exiting={ZoomOut}>
                                    {
                                        button.isLoading ?
                                            <ActivityIndicator color={THEME.colors.primary} /> :
                                            React.cloneElement(button.icon, {
                                                color: menu.active === button.type ? button.activeColor : button.color
                                            })
                                    }
                                </Animated.View>
                                <Text className='text-xs' style={[{ color: menu.active === button.type ? button.activeColor : button.color }]}>{button.label}</Text>
                                <Animated.View className='h-1 items-center justify-end' key={menu.active} entering={FadeIn.springify().duration(1000)} exiting={FadeOut.springify()}>
                                    {menu.active === button.type && <View className='w-[20] h-[2] rounded-3xl opacity-50' style={{ backgroundColor: button.activeColor }}></View>}
                                </Animated.View>
                            </TouchableOpacity>
                        </View>
                    ))
                }
            </View>
        </Animated.View >
    )
}

export default MenuWindow
