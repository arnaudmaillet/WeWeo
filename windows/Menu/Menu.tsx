import { Modal, StyleSheet, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, ZoomIn, FadeInDown, FadeOutUp, FadeOutDown, runOnJS, FadeIn, FadeOut } from 'react-native-reanimated'
import { FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { THEME } from '~/constants/constants';
import { useWindow } from '~/contexts/windows/Context';
import { MenuType } from '~/contexts/windows/types';
import FriendsList from '~/components/friends/List';
import { useAuth } from '~/contexts/AuthProvider';
import { IFriend } from '~/types/UserInterfaces';
import { useMarker } from '~/contexts/markers/Context';

interface MenuWindowProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}

const MenuWindow: React.FC<MenuWindowProps> = ({ onFocusInput, onBlurInput }) => {
    const [searchContent, setSearchContent] = React.useState<string>('')

    const { user, isLoading } = useAuth()
    const { getFromFriends } = useMarker()
    const { state: windowState, setLoaded: setWindowLoaded, setMenu: setWindowMenu } = useWindow()
    const [friends, setFriends] = useState<IFriend[]>([])

    const isTyping = searchContent !== '';

    // useEffect(() => {
    //     getFromFriends(friends)
    // }, [friends])

    return (
        <Animated.View
            key={windowState.active}
            style={[styles.container]}
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify().withCallback(() => runOnJS(setWindowLoaded)(true))}
        >
            <View style={styles.row}>
                {
                    windowState.menu === MenuType.FRIENDS && <View>
                        <FriendsList selected={friends} setSelected={setFriends} style={{ paddingHorizontal: 15 }} />
                    </View>
                }

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginHorizontal: 15 }}>
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
                            onFocus={onFocusInput}  // Appelle cette fonction lorsque l'input est focus
                            onBlur={onBlurInput}  // Appelle cette fonction lorsque l'input perd le focus
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
                <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 15 }}>
                    <TouchableOpacity onPress={() => setWindowMenu(MenuType.DISCOVER)} style={styles.button}>
                        <Ionicons name='compass-outline' size={20} color={windowState.menu === MenuType.DISCOVER ? THEME.colors.primary : 'gray'} />
                        <Text style={[{ color: windowState.menu === MenuType.DISCOVER ? THEME.colors.primary : 'gray' }, styles.buttonMenu]}>Discover</Text>
                        <Animated.View style={{ height: 4, justifyContent: 'flex-end' }} entering={FadeIn.springify().duration(1000)} exiting={FadeOut.springify()} key={windowState.menu}>
                            {windowState.menu === MenuType.DISCOVER && <View style={{ backgroundColor: THEME.colors.primary, height: 2, width: 20, borderRadius: 10, opacity: .5 }}></View>}
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setWindowMenu(MenuType.SUBS)} style={styles.button}>
                        <MaterialIcons name='bookmark-outline' size={20} color={windowState.menu === MenuType.SUBS ? THEME.colors.primary : 'gray'} />
                        <Text style={[{ color: windowState.menu === MenuType.SUBS ? THEME.colors.primary : 'gray' }, styles.buttonMenu]}>Subs</Text>
                        <Animated.View style={{ height: 4, justifyContent: 'flex-end' }} entering={FadeIn.springify().duration(1000)} exiting={FadeOut.springify()} key={windowState.menu}>
                            {windowState.menu === MenuType.SUBS && <View style={{ backgroundColor: THEME.colors.primary, height: 2, width: 20, borderRadius: 10, opacity: .5 }}></View>}
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setWindowMenu(MenuType.FRIENDS)} style={styles.button} disabled={isLoading || user?.friends.length === 0}>
                        <MaterialIcons name='group' size={20} color={windowState.menu === MenuType.FRIENDS ? THEME.colors.primary : isLoading || user?.friends.length === 0 ? THEME.colors.grayscale.darker_2x : 'gray'} />
                        <Text style={[{ color: windowState.menu === MenuType.FRIENDS ? THEME.colors.primary : isLoading || user?.friends.length === 0 ? THEME.colors.grayscale.darker_2x : 'gray' }, styles.buttonMenu]}>Friends</Text>
                        <Animated.View style={{ height: 4, justifyContent: 'flex-end' }} entering={FadeIn.springify().duration(1000)} exiting={FadeOut.springify()} key={windowState.menu}>
                            {windowState.menu === MenuType.FRIENDS && <View style={{ backgroundColor: THEME.colors.primary, height: 2, width: 20, borderRadius: 10, opacity: .5 }}></View>}
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setWindowMenu(MenuType.HISTORY)} style={styles.button}>
                        <MaterialIcons name="history" size={20} color={windowState.menu === MenuType.HISTORY ? THEME.colors.primary : 'gray'} />
                        <Text style={[{ color: windowState.menu === MenuType.HISTORY ? THEME.colors.primary : 'gray' }, styles.buttonMenu]}>History</Text>
                        <Animated.View style={{ height: 4, justifyContent: 'flex-end' }} entering={FadeIn.springify().duration(1000)} exiting={FadeOut.springify()} key={windowState.menu}>
                            {windowState.menu === MenuType.HISTORY && <View style={{ backgroundColor: THEME.colors.primary, height: 2, width: 20, borderRadius: 10, opacity: .5 }}></View>}
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setWindowMenu(MenuType.NEW)} style={styles.button}>
                        <MaterialIcons name="add-location-alt" size={20} color={windowState.menu === MenuType.NEW ? THEME.colors.primary : 'gray'} />
                        <Text style={[{ color: windowState.menu === MenuType.NEW ? THEME.colors.primary : 'gray' }, styles.buttonMenu]}>New</Text>
                        <Animated.View style={{ height: 4, justifyContent: 'flex-end' }} entering={FadeIn.springify().duration(1000)} exiting={FadeOut.springify()} key={windowState.menu}>
                            {windowState.menu === MenuType.NEW && <View style={{ backgroundColor: THEME.colors.primary, height: 2, width: 20, borderRadius: 10, opacity: .5 }}></View>}
                        </Animated.View>
                    </TouchableOpacity>
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
        borderRadius: 20,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: .4,
        shadowRadius: 20,
        elevation: 10,
    },
    row: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 20
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
        borderRadius: 10,
        paddingHorizontal: 10,
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
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonMenu: {
        fontSize: 10
    }
});
