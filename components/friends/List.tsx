import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { useAuth } from '~/contexts/AuthProvider';
import { IUser } from '~/types/UserInterfaces';
import { THEME } from '~/constants/constants';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface FriendsListProps {
    selected: string[]
    setSelected: (friendsIds: string[]) => void
}

const FriendsList: FC<FriendsListProps> = ({ selected, setSelected }) => {

    const { user } = useAuth()

    if (!user) return

    const handleSelect = (friendId: string) => {
        const updatedList = selected.includes(friendId)
            ? selected.filter((id) => id !== friendId)
            : [...selected, friendId];
        setSelected(updatedList);
    };


    const userItem = ({ item }: { item: IUser }) => {

        const isSelected = selected.includes(item.userId);

        return (
            <View style={styles.flatListItem}>
                <TouchableWithoutFeedback
                    style={[styles.iconContainer, isSelected && styles.selected]}
                    onPress={() => handleSelect(item.userId)}
                >
                    <Text style={[styles.iconText, isSelected && styles.selectedText]}>
                        {item.username.slice(0, 2).toUpperCase()}
                    </Text>
                </TouchableWithoutFeedback>
                <View>
                    <Text style={styles.username}>
                        {item.username.length > 6 ? item.username.slice(0, 6) + '...' : item.username}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <FlatList
            data={user?.friends}
            horizontal={true}
            keyExtractor={(user: IUser) => user.userId.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={userItem}
        />
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: THEME.colors.grayscale.darker_x1
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
});

export default FriendsList;
