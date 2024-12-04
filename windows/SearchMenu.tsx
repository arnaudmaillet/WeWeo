import { Modal, StyleSheet, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, ZoomIn, ZoomInEasyDown, interpolateColor, SlideInDown, SlideOutDown, FadeInUp, FadeInDown, FadeOutUp, FadeOutDown, runOnJS } from 'react-native-reanimated'
import { FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '~/contexts/AuthProvider';
import { IUser } from '~/types/UserInterfaces';
import { useMap } from '~/contexts/MapProvider';
import { ISwitch } from '~/types/ButtonInterface';
import Switch from '../components/Switch';
import { THEME } from '~/constants/constants';
import { useWindow } from '~/contexts/windows/Context';

interface SearchMenuWindowProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}

const UserItem: React.FC<{ user: IUser; isactive: boolean; isAnyactive: boolean; onPress: () => void }> = ({ user, isactive, onPress }) => {
    // Animation pour la couleur de fond
    const backgroundColorValue = useSharedValue(isactive ? 0 : 1);

    const { user: currentUser } = useAuth();

    // Détermine si l'utilisateur actuel suit cet utilisateur
    const isFollowing = () => {
        if (currentUser?.friends) {
            return currentUser.friends.some((friend: IUser) => friend.userId === user.userId);
        } else {
            return false;
        }
    }

    const mainColor = isFollowing() ? '#DA70D6' : '#0088cc';

    useEffect(() => {
        backgroundColorValue.value = withTiming(isactive ? 0 : 1, { duration: 300 });
    }, [isactive]);

    // Style animé pour la couleur de fond et du texte
    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                backgroundColorValue.value,
                [0, 1],
                [mainColor, '#f0f0f0'] // De bleu à gris clair
            ),
            borderColor: mainColor,
            borderWidth: .8,
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            color: interpolateColor(
                backgroundColorValue.value,
                [0, 1],
                ['#ffffff', mainColor] // De blanc à bleu
            ),
        };
    });

    return (
        <Animated.View
            entering={ZoomInEasyDown.springify().damping(17).delay(500).randomDelay()}
            key={user.userId}
        >
            <TouchableOpacity onPress={onPress}>
                <Animated.View style={[styles.accountIconContainer, animatedStyle]}>
                    <Animated.Text style={[styles.accountIconText, animatedTextStyle]}>
                        {user.username.slice(0, 2).toUpperCase()}
                    </Animated.Text>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};




const SearchMenuWindow: React.FC<SearchMenuWindowProps> = ({ onFocusInput, onBlurInput }) => {
    const [searchContent, setSearchContent] = React.useState<string>('')
    const [modalVisible, setModalVisible] = useState(false);

    const { user, isLoading, signOut } = useAuth();
    const { state: windowState, setLoaded: setWindowLoaded } = useWindow()
    const { category, setCategory, displayMarkersForUser, setDisplayMarkersForUser } = useMap();

    const isTyping = searchContent !== '';


    // Valeur partagée pour animer la couleur de fond
    const backgroundColorValue = useSharedValue(category);


    // const getFollowingAccounts = (): IUser[] => {
    //     if (category === 2) {
    //         return Users.data.filter((u: IUser) => user?.following.includes(u.userId))
    //     } else {
    //         return Users.data
    //     }
    // }

    // Lorsqu'un utilisateur est sélectionné ou désélectionné
    const handlePressUser = (userId: string) => {
        if (displayMarkersForUser === userId) {
            backgroundColorValue.value = withTiming(0); // Revenir à la couleur par défaut (bleu)
            setDisplayMarkersForUser(null);  // Désélectionner l'utilisateur
        } else {
            backgroundColorValue.value = withTiming(1); // Passer à gris clair
            setDisplayMarkersForUser(userId);  // Sélectionner l'utilisateur
        }
    };

    const handleSignOut = async () => {
        signOut().then(() => {
            setModalVisible(false);
        });
    };

    const visibilitySwitch: ISwitch = {
        buttons: [
            {
                text: {
                    label: 'Discover',
                    color: {
                        active: THEME.colors.text.white,
                        default: THEME.colors.text.black
                    }
                },
                icon: {
                    component: <Ionicons />,
                    size: 16,
                    label: 'compass-outline',
                    color: {
                        active: THEME.colors.text.white,
                        default: THEME.colors.primary,
                    }
                },
                background: {
                    active: THEME.colors.primary,
                    default: THEME.colors.grayscale.main,
                }
            },
            {
                text: {
                    label: 'Friends',
                    color: {
                        active: THEME.colors.text.white,
                        default: THEME.colors.text.black
                    }
                },
                icon: {
                    component: <MaterialIcons />,
                    size: 16,
                    label: 'group',
                    color: {
                        active: THEME.colors.text.white,
                        default: THEME.colors.primary,
                    }
                },
                background: {
                    active: THEME.colors.primary,
                    default: THEME.colors.grayscale.main,
                }
            },
            {
                text: {
                    label: 'Favorite',
                    color: {
                        active: THEME.colors.text.white,
                        default: THEME.colors.text.black
                    }
                },
                icon: {
                    component: <MaterialIcons />,
                    size: 16,
                    label: 'favorite-outline',
                    color: {
                        active: THEME.colors.text.white,
                        default: THEME.colors.primary,
                    }
                },
                background: {
                    active: THEME.colors.primary,
                    default: THEME.colors.grayscale.main,
                }
            },
        ],
    }

    return (
        <Animated.View
            key={windowState.active}
            style={[styles.container]}
            entering={FadeInDown.springify()}
            exiting={FadeOutDown.springify().withCallback(() => runOnJS(setWindowLoaded)(true))}
        >
            {/* <FlatList
                data={getFollowingAccounts()}
                horizontal={true}
                keyExtractor={(user: IUser) => user.userId.toString()}
                key={getFollowingAccounts().flatMap(u => u.userId).join('')} // Forcer le remontage de la liste
                showsHorizontalScrollIndicator={false}
                style={styles.followingAccounts}
                renderItem={({ item: user }) => (
                    <UserItem
                        user={user}
                        isactive={displayMarkersForUser === user.userId}
                        isAnyactive={displayMarkersForUser !== undefined}
                        onPress={() => handlePressUser(user.userId)}
                    />
                )}
            /> */}
            <View style={styles.secondRow}>
                {/* Row with user icon and switch container */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)} // Ferme le modal sur retour
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPressOut={() => setModalVisible(false)} // Ferme le modal si on clique à l'extérieur
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>您确定要登出吗？</Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.buttonContainer, styles.cancelButton]} // Bouton Annuler en gris
                                    onPress={() => setModalVisible(false)} // Ferme le modal
                                >
                                    <Text style={styles.buttonText}>取消</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.buttonContainer, styles.logoutButton]} // Bouton Se déconnecter en rouge
                                    onPress={handleSignOut} // Déconnexion
                                >
                                    {
                                        user?.userId && !isLoading ? (
                                            <Text style={styles.buttonText}>登出</Text>
                                        ) : (
                                            <ActivityIndicator size="small" color="white" />
                                        )
                                    }

                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <View style={styles.userIconContainer}>
                    <View style={styles.userIconContainer}>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Ionicons name="person-circle-outline" size={40} color="#D3D3D3" />
                        </TouchableOpacity>
                        <View style={styles.userStats}>
                            <MaterialCommunityIcons name="lightning-bolt" size={12} color="#D3D3D3" />
                            <Text style={{ fontSize: 12 }}>100</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.row}>
                    {/* PanGestureHandler for swipe functionality */}
                    <Switch props={visibilitySwitch} />

                    {/* Input field with search icon on the left */}
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
            </View>
        </Animated.View>
    )
}

export default SearchMenuWindow

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.main,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: .4,
        shadowRadius: 20,
        elevation: 10,
    },
    secondRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    followingAccounts: {
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        padding: 5,
    },
    accountIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    accountIconText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    row: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    userIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        width: 300,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
    },
    buttonContainer: {
        width: '45%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        height: 40
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    logoutButton: {
        backgroundColor: '#ff4d4d',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.grayscale.darker_1x,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 40,
        marginTop: 20,
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
    userStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
});
