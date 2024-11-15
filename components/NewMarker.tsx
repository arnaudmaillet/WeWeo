import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import Animated, { runOnJS, SlideInDown } from 'react-native-reanimated'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import Switch from './Switch'
import { ISwitch } from '~/types/SwitchInterface'
import { INPUT, THEME } from '~/constants/constants'
import { useMap } from '~/providers/MapProvider'


interface NewMarkerProps {
    onFocusInput: () => void;
    onBlurInput: () => void;
}

const NewMarker: React.FC<NewMarkerProps> = ({ onFocusInput, onBlurInput }) => {

    const [inputValue, setInputValue] = React.useState<string>('')

    const { newMarker, setNewMarker, addMarker } = useMap();

    const privacySwitch: ISwitch = {
        label: 'Privacy',
        buttons: [
            {
                label: 'Public',
                class: <Ionicons />,
                name: 'globe-outline',
                color: THEME.colors.primary,
                textColor: THEME.colors.text.black,
                iconColorSelected: THEME.colors.accent,
                size: 16,
            },
            {
                label: 'Friends',
                class: <MaterialIcons />,
                name: 'group',
                color: THEME.colors.primary,
                textColor: THEME.colors.text.black,
                iconColorSelected: THEME.colors.accent,
                size: 16,
            },
            {
                label: 'Private',
                class: <MaterialIcons />,
                name: 'lock-outline',
                color: THEME.colors.primary,
                textColor: THEME.colors.text.black,
                iconColorSelected: THEME.colors.accent,
                size: 16,
            },
        ],
    }

    const handleInputValue = (text: string) => {
        setInputValue(text)
        newMarker && setNewMarker({ ...newMarker, label: text })
    }


    return (
        <Animated.View key="newMarker" style={styles.container} entering={SlideInDown.springify().damping(17)}>
            <View style={styles.row}>
                <Switch props={privacySwitch} />
                {/* Input field with search icon on the left */}
                <Animated.View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        maxLength={INPUT.max_length.first_message}
                        placeholder="Type something..."
                        value={inputValue}
                        onChangeText={handleInputValue}
                        onFocus={onFocusInput}
                        onBlur={onBlurInput}
                        returnKeyType='send'
                        onSubmitEditing={() => {
                            if (newMarker && inputValue.length > 0) {
                                addMarker()
                                setInputValue('')
                                runOnJS(onBlurInput)()
                            }
                        }}
                    />

                    <View style={styles.characterCountContainer}>
                        <Text style={[styles.characterCountText, { color: inputValue.length < 25 ? '#B0B0B0' : 'rgba(255,87,51,0.5)' }]}>{inputValue.length}/ {INPUT.max_length.first_message}</Text>
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
        backgroundColor: THEME.colors.background.main,
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
        backgroundColor: THEME.colors.background.darker_x1,
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 40,
        marginTop: 20,
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