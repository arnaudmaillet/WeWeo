import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { THEME } from '~/constants/constants'
import { useMarker } from '~/contexts/markers/Context'
import SettingsWrapper from '~/components/marker/SettingsWrapper'
import { Image } from 'expo-image';

interface IMarkerHeader { }

const MarkerHeader: React.FC<IMarkerHeader> = () => {

    const { state: markerState } = useMarker()

    if (!markerState.active) return null

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.iconContainer}>
                    {markerState.active.icon ? (
                        <Image
                            source={{ uri: markerState.active.icon }}
                            style={styles.sticker}
                            contentFit="contain"
                        />
                    ) : (
                        <Image
                            source={{
                                uri: 'https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker1.gif',
                            }}
                            style={styles.sticker}
                            contentFit="contain"
                        />
                    )}
                </View>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>
                        {markerState.active.label.length > 0 ? markerState.active.label : 'test'}
                    </Text>
                </View>
                <View style={styles.settingsContainer}>
                    <SettingsWrapper />
                </View>
            </View>
        </View>
    )
}

export default MarkerHeader

const styles = StyleSheet.create({
    container: {
        height: 65,
        paddingVertical: 8,
        marginHorizontal: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: THEME.colors.grayscale.darker_1x,
    },
    innerContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    iconContainer: {
        width: 50,
        backgroundColor: THEME.colors.grayscale.darker_1x,
        borderRadius: 10,
    },
    labelContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    label: {
        color: 'gray',
    },
    settingsContainer: {
        width: 65,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sticker: {
        height: 40,
        width: 40,
        alignSelf: 'center',
        flex: 1,
    },
})