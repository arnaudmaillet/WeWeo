import { FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, ZoomIn, ZoomInEasyDown, interpolateColor } from 'react-native-reanimated'
import { PanGestureHandler } from 'react-native-gesture-handler';
import { FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '~/providers/AuthProvider';
import Users from '~/data/users.json';
import { IUser } from '~/types/UserInterfaces';
import { useMap } from '~/providers/MapProvider';

interface SearchMenuProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}

const UserItem: React.FC<{ user: IUser; isSelected: boolean; isAnySelected: boolean; onPress: () => void }> = ({ user, isSelected, onPress }) => {
    // Animation pour la couleur de fond
    const backgroundColorValue = useSharedValue(isSelected ? 0 : 1);

    const { user: currentUser } = useAuth();

    // Détermine si l'utilisateur actuel suit cet utilisateur
    const isFollowing = () => {
        if (currentUser?.following) {
            return currentUser.following.includes(user.id);
        } else {
            return false;
        }
    }

    const mainColor = isFollowing() ? '#DA70D6' : '#0088cc';

    useEffect(() => {
        backgroundColorValue.value = withTiming(isSelected ? 0 : 1, { duration: 300 });
    }, [isSelected]);

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
            key={user.id}
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




const SearchMenu: React.FC<SearchMenuProps> = ({ onFocusInput, onBlurInput }) => {
    const [searchContent, setSearchContent] = React.useState<string>('')
    const [switchWidth, setSwitchWidth] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false);

    const { user, isLoading, signOut } = useAuth();
    const { category, setCategory, displayMarkersForUser, setDisplayMarkersForUser } = useMap();

    const isTyping = searchContent !== '';

    // Animation shared value for the sliding effect
    const slidePosition = useSharedValue(category)

    // Valeur partagée pour animer la couleur de fond
    const backgroundColorValue = useSharedValue(category);

    // Shared value for indicator and text color
    const colorValue = useSharedValue(category);

    // Update indicator color based on category
    useEffect(() => {
        colorValue.value = withTiming(category, { duration: 300 });
    }, [category]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: slidePosition.value }],
            width: switchWidth / 3,
            backgroundColor: interpolateColor(
                colorValue.value,
                [0, 1, 2],
                ['#0088cc', '#FF7518', '#DA70D6'] // Couleurs selon la catégorie
            ),
        };
    });


    useEffect(() => {
        if (switchWidth > 0) {
            const buttonWidth = switchWidth / 3;
            slidePosition.value = withTiming(category * buttonWidth, { duration: 300 }); // Se positionner en fonction de la catégorie
        }
    }, [switchWidth, category]);

    // Update position when switch changes with less pronounced spring animation
    const handleSwitchChange = (index: number) => {
        setCategory(index)
        const buttonWidth = switchWidth / 3; // Calculate the width of each button
        slidePosition.value = withSpring(index * buttonWidth, {
            damping: 20,
            stiffness: 100,
        });
    }

    // Handle layout to get the switchContainer's width
    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setSwitchWidth(width);
    }

    // Handle swipe gesture to follow the user's finger
    const handleGestureEvent = (event: any) => {
        const { translationX } = event.nativeEvent;
        const buttonWidth = switchWidth / 3;

        // Update the slidePosition as the user swipes
        const newPosition = category * buttonWidth + translationX;
        if (newPosition >= 0 && newPosition <= switchWidth - buttonWidth) {
            slidePosition.value = newPosition;
        }
    }

    // Handle the end of the gesture to snap the switch to the nearest button
    const handleGestureEnd = (event: any) => {
        const { translationX } = event.nativeEvent;
        const buttonWidth = switchWidth / 3;

        // Calculate the final position based on how far the user swiped
        const newActiveSwitch = Math.round((category * buttonWidth + translationX) / buttonWidth);

        // Make sure the new index is within the valid range [0, 2]
        const validIndex = Math.max(0, Math.min(2, newActiveSwitch));
        handleSwitchChange(validIndex);
    }


    const getFollowingAccounts = (): IUser[] => {
        if (category === 2) {
            return Users.data.filter((u: IUser) => user?.following.includes(u.id))
        } else {
            return Users.data
        }
    }


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


    return (
        <View style={styles.container}>
            <FlatList
                data={getFollowingAccounts()}
                horizontal={true}
                keyExtractor={(user: IUser) => user.id.toString()}
                key={getFollowingAccounts().flatMap(u => u.id).join('')} // Forcer le remontage de la liste
                showsHorizontalScrollIndicator={false}
                style={styles.followingAccounts}
                renderItem={({ item: user }) => (
                    <UserItem
                        user={user}
                        isSelected={displayMarkersForUser === user.id}
                        isAnySelected={displayMarkersForUser !== undefined}
                        onPress={() => handlePressUser(user.id)}
                    />
                )}
            />
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
                                        user?.id && !isLoading ? (
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
                    <PanGestureHandler onGestureEvent={handleGestureEvent} onEnded={handleGestureEnd}>
                        <Animated.View
                            style={styles.switchContainer}
                            onLayout={handleLayout} // Capture the layout when the component is rendered
                        >
                            {/* Sliding indicator behind buttons */}
                            <Animated.View style={[styles.switchIndicator, animatedIndicatorStyle]} />

                            {/* Switch buttons */}
                            <TouchableOpacity style={styles.switchButton} onPress={() => handleSwitchChange(0)}>
                                <View style={styles.switchContent}>
                                    <Ionicons name="compass-outline" size={16} color={category === 0 ? "white" : "#0088cc"} />
                                    <Animated.Text style={[styles.switchText, { color: category === 0 ? "white" : "#0088cc" }]}>Discover</Animated.Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.switchButton} onPress={() => handleSwitchChange(1)}>
                                <View style={styles.switchContent}>
                                    <Ionicons name="flame-outline" size={16} color={category === 1 ? "white" : "#FF7518"} />
                                    <Animated.Text style={[styles.switchText, { color: category === 1 ? "white" : "#FF7518" }]}>Trending</Animated.Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.switchButton} onPress={() => handleSwitchChange(2)}>
                                <View style={styles.switchContent}>
                                    <Ionicons name="people-outline" size={16} color={category === 2 ? "white" : "#DA70D6"} />
                                    <Animated.Text style={[styles.switchText, { color: category === 2 ? "white" : "#DA70D6" }]}>Friends</Animated.Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </PanGestureHandler>

                    {/* Input field with search icon on the left */}
                    <Animated.View style={styles.inputContainer}>
                        <Ionicons name="search-outline" size={20} color="#D3D3D3" style={styles.searchIcon} />
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
                                    <MaterialIcons name="cancel" size={20} color="rgba(0, 0, 0, 0.25)" />
                                ) : (
                                    <FontAwesome6 name="microphone" size={18} color='#D3D3D3' />
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                    </Animated.View>
                </View>
            </View>
        </View>
    )
}

export default SearchMenu

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
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
        backgroundColor: '#0088cc',
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    accountIconText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    row: {
        flex: 1, // This will take the rest of the space in the row
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    userIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15, // Space between the user icon and the switch/input
        flex: 0.2, // Take 10% of the space
        padding: 2,
    },
    userStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent pour le modal
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20, // Augmentation du padding pour plus d'espace
        borderRadius: 15, // Bordures plus arrondies
        width: 300, // Largeur augmentée pour un meilleur design
        alignItems: 'center',
        shadowColor: '#000', // Ombre pour un effet flottant
        shadowOffset: { width: 0, height: 4 }, // Position de l'ombre
        shadowOpacity: 0.3, // Opacité de l'ombre
        shadowRadius: 8, // Rayon de l'ombre
        elevation: 10, // Ombre pour Android
    },
    modalTitle: {
        fontSize: 20, // Augmentation de la taille du texte pour plus de lisibilité
        fontWeight: 'bold',
        color: '#333', // Texte de couleur plus sombre
        marginBottom: 20,
        textAlign: 'center', // Centrer le texte
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
        justifyContent: 'center',  // Centrage vertical
        paddingVertical: 10,
        borderRadius: 10,
        height: 40
    },
    cancelButton: {
        backgroundColor: '#ccc', // Bouton d'annulation en gris clair
    },
    logoutButton: {
        backgroundColor: '#ff4d4d', // Rouge pour Se déconnecter
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        height: 40, // Same height for consistency
    },
    switchButton: {
        flex: 1,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    switchContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 5,
    },
    switchIndicator: {
        position: 'absolute',
        height: '100%',
        backgroundColor: '#0088cc',
        borderRadius: 8,
        zIndex: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        paddingHorizontal: 10,
        height: 40,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
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
});
