import { View, Text, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import Animated, { ZoomIn, FadeInDown, FadeOutDown, runOnJS, FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming, withSpring, ZoomOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { THEME } from '~/constants/constants';
import { useWindow } from '~/contexts/windows/Context';
import { useMarker } from '~/contexts/markers/Context';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import FriendsList from '~/components/friends/List';
import { useNavbarStore } from '~/store/navbarStore';
import { TabType, ITab } from '~/types/navbarTypes';
import { useUserStore } from '~/store/userStore';
import { IFriend } from '~/types/userTypes';
import { useHistory } from '~/hooks/useHistory';

interface NavbarWindowProps { }

const NavbarWindow: React.FC<NavbarWindowProps> = () => {
    const [searchContent, setSearchContent] = React.useState<string>('')

    const { user } = useUserStore()
    const { data: history } = useHistory()
    const { tabs, active: activeTab, setActive: setActiveTab, isOpen: isTabOpen, setOpen: setTabOpen } = useNavbarStore()
    const { window, setActive: setActiveWindow, setLoaded: setWindowLoaded } = useWindow()
    const { state: markerState, setFiltered, setPreview: setPreviewMarker, firestoreFetch: firestoreFetchMarkers } = useMarker()
    const [friends, setFriends] = useState<IFriend[]>([])
    const [tabPressedEvent, setTabPressedEvent] = useState<boolean>(false)
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
        if (activeTab === TabType.HISTORY) {
            if (isTabOpen) {
                containerHeight.value = withSpring(HISTORY_CONTAINER_HEIGHT, {
                    damping: 15,
                    stiffness: 120,
                });
                containerOpacity.value = withTiming(1, { duration: 300 })
            } else {
                containerOpacity.value = withTiming(0, { duration: 150 })
                containerHeight.value = withTiming(0);
            }
        } else if (activeTab === TabType.FRIENDS) {
            if (isTabOpen) {
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
            setTabPressedEvent(false)
        }
    }, [tabPressedEvent])


    return (
        <Animated.View
            key={window.active}
            className="bg-grayscale py-3 rounded-3xl shadow-lg"
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify().withCallback(() => runOnJS(setWindowLoaded)(true))}
        >

            <Animated.View key={activeTab} style={animatedContainerStyle} entering={FadeIn.springify().delay(300)} exiting={FadeOut.springify().duration(300)}>
                {
                    activeTab === TabType.FRIENDS &&
                    <View className='mb-4'>
                        <FriendsList selected={friends} setSelected={setFriends} style={{ paddingHorizontal: 15 }} />
                    </View>
                }
                {
                    activeTab === TabType.HISTORY &&
                    <View className='mb-4 mx-5'>
                        <View className='bg-primary/75 h-[2] w-[20] ml-[15] rounded-xl'></View>
                        <FlatList
                            data={history?.slice().reverse()}
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
                    tabs.map((tab: ITab) => (
                        <View className='items-center flex-1' key={tab.type}>
                            <TouchableOpacity onPress={() => {
                                if (activeTab === tab.type) {
                                    setTabOpen(!isTabOpen)
                                } else if (tab.type === TabType.HISTORY) {
                                    setTabOpen(true)
                                    setActiveTab(tab.type)
                                } else if (tab.type === TabType.FRIENDS) {
                                    setTabOpen(true)
                                    setActiveTab(tab.type)
                                } else {
                                    setActiveTab(tab.type)
                                }
                                setTabPressedEvent(!tabPressedEvent)
                            }} onLongPress={() => activeTab === tab.type && firestoreFetchMarkers(tab.type)}>
                                <Animated.View className='h-[25] items-center justify-center' key={tab.isLoading.toString()} entering={ZoomIn.springify()} exiting={ZoomOut}>
                                    {
                                        tab.isLoading ?
                                            <ActivityIndicator color={THEME.colors.primary} /> :
                                            React.cloneElement(tab.icon, {
                                                color: activeTab === tab.type ? tab.activeColor : tab.color
                                            })
                                    }
                                </Animated.View>
                                <Text className='text-xs' style={[{ color: activeTab === tab.type ? tab.activeColor : tab.color }]}>{tab.label}</Text>
                                <View className='translate-y-[2]'>
                                    <Animated.View className='h-[5] items-center justify-end' key={activeTab} entering={ZoomIn.springify()} exiting={ZoomOut.springify()}>
                                        {activeTab === tab.type && <View className='w-[5] h-[5] rounded-3xl opacity-50' style={{ backgroundColor: tab.activeColor }}></View>}
                                    </Animated.View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ))
                }
            </View>
        </Animated.View >
    )
}

export default NavbarWindow
