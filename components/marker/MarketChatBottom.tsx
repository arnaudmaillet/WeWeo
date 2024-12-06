export interface IMarkerChatScreen { }

import { FontAwesome6 } from '@expo/vector-icons';
import { View, StyleSheet, Text } from 'react-native'
import { FlatList } from 'react-native-gesture-handler';
import { THEME } from '~/constants/constants';
import StickersList from '../stickers/List';
import FriendsList from '../friends/List';
import { useMarker } from '~/contexts/markers/Context';
import { IUser } from '~/types/UserInterfaces';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

interface IMarkerChatScreenBottom { }

const MarkerChatBottom: React.FC<IMarkerChatScreenBottom> = () => {

    const userItem = ({ item }: { item: IUser }) => {
        return (
            <View style={styles.flatListItem}>
                <View style={[styles.iconContainer]}>
                    <Text style={styles.iconText}>
                        {item.username.slice(0, 2).toUpperCase()}
                    </Text>
                </View>
                <View>
                    <Text style={styles.username}>
                        {item.username.length > 6 ? item.username.slice(0, 6) + '...' : item.username}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.ellipsis}>
                <FontAwesome6 name="ellipsis" size={20} color={THEME.colors.grayscale.darker_3x} />
            </View>
            <View style={styles.listContainer}>
                {/* <StickersList isHorizontal={false} /> */}
                {/* <FlatList
                    data={markerState.active!.connectedUserIds}
                    renderItem={userItem}
                    numColumns={5}
                /> */}
                {/* <FriendsList

                /> */}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.grayscale.main,
        borderRadius: 15,
        borderColor: 'rgba(0, 0, 0, 0.15)',
        borderWidth: 0.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    listContainer: {
        flex: 1,
        backgroundColor: THEME.colors.grayscale.lighter_1x,
        marginTop: 15,
        margin: 10,
        borderRadius: 10,
    },
    ellipsis: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        top: -3,
        left: '50%',
        transform: [{ translateX: -25 }],
        width: 50,
    },
    flatListItem: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        width: 50,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.colors.grayscale.darker_1x
    },
    iconText: {
        color: THEME.colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    username: {
        color: 'gray',
        fontSize: 10
    },
    selected: {
        backgroundColor: THEME.colors.accent,
        borderColor: THEME.colors.primary,
        borderWidth: 2,
    },
    selectedText: {
        color: THEME.colors.text.black,
        fontWeight: 'bold',
    },
})


export default MarkerChatBottom;