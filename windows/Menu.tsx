import { StyleSheet, TextInput, View, Text, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Animated, { ZoomIn, FadeInDown, FadeOutDown, runOnJS, FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { THEME } from '~/constants/constants';
import { useWindow } from '~/contexts/windows/Context';
import { useMarker } from '~/contexts/markers/Context';
import { useUser } from '~/contexts/user/Context';
import { IFriend } from '~/contexts/user/types';
import { useMenu } from '~/contexts/menu/Context';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface MenuWindowProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}

const MenuWindow: React.FC<MenuWindowProps> = ({ onFocusInput, onBlurInput }) => {
    const [searchContent, setSearchContent] = React.useState<string>('')

    const { user } = useUser()
    const { menu } = useMenu()
    const { window, setLoaded: setWindowLoaded, setMenu: setWindowMenu } = useWindow()
    const { setFiltered } = useMarker()
    const [friends, setFriends] = useState<IFriend[]>([])
    const [displayContainer, setDisplayContainer] = useState<boolean>(false)

    const containerHeight = useSharedValue(0);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        height: withTiming(containerHeight.value, { duration: 300 })
    }));

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

    const isTyping = searchContent !== '';
    const toggleContainer = () => {
        setDisplayContainer(prev => {
            const newState = !prev;
            containerHeight.value = newState ? 500 : 0; // Adjust heights accordingly
            return newState;
        });
    };

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
                <Animated.View style={[animatedContainerStyle]}>
                    {
                        displayContainer &&
                        <Text style={{ backgroundColor: THEME.colors.grayscale.main }}>container qui s'affiche au click d'un bouton</Text>
                    }
                </Animated.View>
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
                                <TouchableWithoutFeedback onPress={() => {
                                    setWindowMenu(button.type)
                                    toggleContainer()
                                }}>
                                    <View style={styles.buttonIcon}>
                                        {
                                            button.isLoading ?
                                                <ActivityIndicator color={THEME.colors.primary} /> :
                                                React.cloneElement(button.icon, {
                                                    color: window.menu === button.type ? button.activeColor : button.color
                                                })
                                        }
                                    </View>
                                    <Text style={[{ color: window.menu === button.type ? button.activeColor : button.color }, styles.buttonMenu]}>{button.label}</Text>
                                    <Animated.View key={window.menu} entering={FadeIn.springify().duration(1000)} exiting={FadeOut.springify()} style={styles.buttonIndicatorContainer} >
                                        {window.menu === button.type && <View style={[styles.buttonIndicator, { backgroundColor: button.activeColor }]}></View>}
                                    </Animated.View>
                                </TouchableWithoutFeedback>
                            </View>
                        ))
                    }
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
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginHorizontal: 15,
        flex: 1
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
        borderRadius: 10,
        opacity: .5
    }
});
