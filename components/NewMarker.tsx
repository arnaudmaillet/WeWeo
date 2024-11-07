import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import Animated, { runOnJS, SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import Switch from './Switch'
import { ISwitch } from '~/types/SwitchInterface'
import { INPUT } from '~/constants/constants'


interface NewMarkerProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}

const NewMarker: React.FC<NewMarkerProps> = ({ onFocusInput, onBlurInput }) => {

    const [inputValue, setInputValue] = React.useState<string>('')

    const privacySwitch: ISwitch = {
        label: 'Privacy',
        buttons: [
            {
                label: 'Public',
                class: <Ionicons />,
                name: 'globe-outline',
                color: '#0088cc',
                size: 16,
            },
            {
                label: 'Friends',
                class: <MaterialIcons />,
                name: 'group',
                color: '#DA70D6',
                size: 16,
            },
            {
                label: 'Private',
                class: <MaterialIcons />,
                name: 'lock-outline',
                color: '#FF7518',
                size: 16,
            },
        ],
    }

    return (
        <Animated.View key="searchMenu" style={styles.container} entering={SlideInDown.springify().damping(17)}>
            <View style={styles.row}>
                <Switch props={privacySwitch} />
                {/* Input field with search icon on the left */}
                <Animated.View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        maxLength={INPUT.max_length.first_message}
                        placeholder="Type your first message here"
                        value={inputValue}
                        onChangeText={setInputValue}
                        onFocus={onFocusInput}
                        onBlur={onBlurInput}
                        returnKeyType='send'
                    />

                    <View style={styles.characterCountContainer}>
                        <Text style={[styles.characterCountText, { color: inputValue.length < 25 ? '#D3D3D3' : 'rgba(255,87,51,0.5)' }]}>{inputValue.length}/ {INPUT.max_length.first_message}</Text>
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    )
}

export default NewMarker

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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 10,
    },
    row: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
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
    input: {
        flex: 1,
        paddingVertical: 8,
    },
    characterCountContainer: {
        padding: 4,
        width: 55,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    characterCountText: {
        fontSize: 14,
    },
});