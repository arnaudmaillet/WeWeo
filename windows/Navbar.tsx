import { View, Text, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import Animated, { ZoomIn, FadeInDown, FadeOutDown, runOnJS, FadeOut, useSharedValue, useAnimatedStyle, withTiming, withSpring, ZoomOut, FadeInRight } from 'react-native-reanimated'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { THEME } from '~/constants/constants';
import { useMarker } from '~/contexts/markers/Context';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import FriendsList from '~/components/friends/List';
import { useNavbarStore } from '~/store/useNavbarStore';
import { TabType, ITab } from '~/types/navbarTypes';
import { IFriend } from '~/types/userTypes';
import { useHistory } from '~/hooks/useHistory';
import { useFriends } from '~/hooks/useFriends';
import { usePosts } from '~/hooks/usePosts';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useWindowStore } from '~/store/useWindowStore';
import { useSubscriptions } from '~/hooks/useSubscriptions';

interface NavbarWindowProps { }

const NavbarWindow: React.FC<NavbarWindowProps> = () => {
    const { window, setLoading } = useWindowStore()
    const { posts } = usePosts()
    const { history } = useHistory()
    const { subscriptions } = useSubscriptions()
    const { friends, friendsPosts } = useFriends()
    const { tabs, active: activeTab, setActive: setActiveTab, isOpen: isTabOpen, setOpen: setTabOpen } = useNavbarStore()
    const { setPreview: setPreviewMarker, firestoreFetch: firestoreFetchMarkers, setList } = useMarker()
    const [activeFriends, setActiveFriends] = useState<IFriend[]>([])
    const [tabPressedEvent, setTabPressedEvent] = useState<boolean>(false)
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);

    const containerHeight = useSharedValue(0);
    const containerOpacity = useSharedValue(0);
    const screenDimensions = Dimensions.get('window');
    const centerBarIndex = Math.floor(tabs.length / 2);

    let index = 0

    const animatedContainerStyle = useAnimatedStyle(() => ({
        height: containerHeight.value,
        opacity: containerOpacity.value
    }));

    const FRIENDS_CONTAINER_HEIGHT = 100
    const HISTORY_CONTAINER_HEIGHT = 100;
    const HISTORY_ITEM_WIDTH = 50;


    useEffect(() => {
        activeTab !== TabType.FRIENDS && setActiveFriends([])
    }, [activeTab])

    useEffect(() => {
        if (!friends.data) return;
        if (activeTab === TabType.FRIENDS) {
            if (activeFriends.length > 0) {
                const filteredFriends = activeFriends
                    .filter(friend => activeFriends.includes(friend))
                    .flatMap(friend => friend.ownerOf);
                setList(filteredFriends);
            } else {
                setList(friendsPosts)
            }
        }
    }, [activeFriends]);

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

    const refetch = (tab: TabType) => {
        impactAsync(ImpactFeedbackStyle.Heavy)
        switch (tab) {
            case TabType.DISCOVER:
                posts.refetch()
                break
            case TabType.FRIENDS:
                friends.refetch()
                break
            case TabType.HISTORY:
                history.refetch()
                break
            case TabType.SUBSCRIPTIONS:
                subscriptions.refetch()
            default:
        }
    }


    return (
        <Animated.View
            key={window}
            className="bg-grayscale py-3 rounded-3xl shadow-lg"
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify().withCallback(() => runOnJS(setLoading)(true))}
        >

            <Animated.View key={activeTab} style={animatedContainerStyle}>
                <Animated.View key={activeTab} className='bg-grayscale-darker_1x mx-3 rounded-xl h-[80] justify-center' exiting={FadeOut.springify().duration(100)}>
                    {
                        (activeTab === TabType.FRIENDS && friends.data) &&
                        <View>
                            <FriendsList selected={activeFriends} setSelected={setActiveFriends} style={{ paddingHorizontal: 5 }} />
                        </View>
                    }
                    {
                        (activeTab === TabType.HISTORY && history.data) &&
                        <View className='px-[5]'>
                            <View className='bg-primary/75 h-[2] w-[20] ml-[15] rounded-xl'></View>
                            <FlatList
                                data={history.data?.slice().reverse()}
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
                                    <Animated.View entering={FadeInRight.springify().delay(index * 50)}>
                                        <TouchableOpacity
                                            style={{
                                                width: HISTORY_ITEM_WIDTH,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <View className={`h-[46] w-[46] bg-grayscale justify-center items-center rounded-xl`}>
                                                {item.icon ? (
                                                    <Image source={{ uri: item.icon }} style={{ height: 40, width: 40 }} contentFit="contain" />
                                                ) : (
                                                    <MaterialCommunityIcons name="set-none" size={24} color={THEME.colors.grayscale.darker_3x} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                )}
                                onMomentumScrollEnd={(event) => {
                                    index = Math.floor(event.nativeEvent.contentOffset.x / HISTORY_ITEM_WIDTH)
                                    setSelectedHistoryIndex(index)
                                    setPreviewMarker(history.data?.slice().reverse()[index] || null)
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
            </Animated.View>
            <View className='flex-row'>
                {
                    tabs.map((tab: ITab, index) => (
                        <Animated.View className='items-center flex-1' key={tab.type} entering={ZoomIn.springify().delay(Math.abs(index - centerBarIndex) * 70).damping(15)}>
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
                            }} onLongPress={() => activeTab === tab.type && refetch(tab.type)}>
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
                        </Animated.View>
                    ))
                }
            </View>
        </Animated.View >
    )
}

export default NavbarWindow
