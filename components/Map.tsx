import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import MapView, { Marker } from 'react-native-maps'

const Map = () => {
    // fake user location San Francisco
    const fakeUserLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    }

    return (
        <View style={styles.map}>
            <MapView
                style={styles.map}
                showsUserLocation={true}
                initialRegion={{
                    latitude: fakeUserLocation.latitude,
                    longitude: fakeUserLocation.longitude,
                    latitudeDelta: fakeUserLocation.latitudeDelta,
                    longitudeDelta: fakeUserLocation.longitudeDelta
                }}
            >
                <Marker
                    coordinate={{
                        latitude: fakeUserLocation.latitude,
                        longitude: fakeUserLocation.longitude,
                    }}
                    title="Vous êtes ici"
                >
                    {/* Custom view for the marker */}
                    <View style={styles.userLocationMaker}>
                        <View style={styles.inneruserLocationMaker} />
                    </View>
                </Marker>
            </MapView>
        </View>
    )
}

export default Map

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: '100%',
    },
    userLocationMaker: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0, 122, 255, 0.3)', // Blue with transparency
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 1,
    },
    inneruserLocationMaker: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: '#007AFF', // Solid blue
    }
})