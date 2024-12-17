import React, { FC } from 'react';
import { FlatList, StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import { useAuth } from '~/contexts/AuthProvider';
import { THEME } from '~/constants/constants';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { useUser } from '~/contexts/user/Context';
import { IFriend } from '~/contexts/user/types';

interface FriendsListProps {
    selected: IFriend[];
    setSelected: (friends: IFriend[]) => void;
    style?: StyleProp<ViewStyle>;
}

interface FriendItemProps {
    friend: IFriend;
    isSelected: boolean;
    handleSelect: (friend: IFriend) => void;
}

const FriendItem: FC<FriendItemProps> = ({ friend, isSelected, handleSelect }) => {
    const animationValue = useSharedValue(isSelected ? 1 : 0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                animationValue.value,
                [0, 1],
                [THEME.colors.grayscale.darker_1x, THEME.colors.primary]
            ),
        };
    });

    const handlePress = () => {
        animationValue.value = withTiming(isSelected ? 0 : 1, { duration: 300 });
        handleSelect(friend);
    };

    return (
        <View style={styles.flatListItem}>
            <TouchableWithoutFeedback onPress={handlePress}>
                <Animated.View style={[styles.iconContainer, animatedStyle]}>
                    <Text style={[styles.iconText, isSelected && styles.selectedText]}>
                        {friend.username.slice(0, 2).toUpperCase()}
                    </Text>
                </Animated.View>
            </TouchableWithoutFeedback>
            <View>
                <Text style={styles.username}>
                    {friend.username.length > 6
                        ? `${friend.username.slice(0, 6)}...`
                        : friend.username}
                </Text>
            </View>
        </View>
    );
};

const FriendsList: FC<FriendsListProps> = ({ selected, setSelected, style }) => {
    const { user } = useUser();

    if (!user || !user.friends) return null;

    const handleSelect = (friend: IFriend) => {
        const updatedList = selected.includes(friend)
            ? selected.filter(_ => _ !== friend)
            : [...selected, friend];
        setSelected(updatedList);
    };

    return (
        <FlatList
            data={user.friends}
            horizontal
            keyExtractor={(friend: IFriend) => friend.userId.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
                <FriendItem
                    friend={item}
                    isSelected={selected.includes(item)}
                    handleSelect={handleSelect}
                />
            )}
            style={style}
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
    },
    iconText: {
        color: THEME.colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    username: {
        color: 'gray',
        fontSize: 10,
    },
    selectedText: {
        color: THEME.colors.text.white,
    },
});

export default FriendsList;
