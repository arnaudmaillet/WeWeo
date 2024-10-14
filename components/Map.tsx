import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

import MapView, { Marker } from 'react-native-maps'


const locations = require('../data/locations.json')

const Map = () => {
    // fake user location San Francisco
    const fakeUserLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    }

    const [zoomLevel, setZoomLevel] = useState(0);

    const handleRegionChange = (region: { latitudeDelta: number }) => {
        const newZoomLevel = calculateZoomLevel(region);
        setZoomLevel(newZoomLevel);
    };

    const calculateZoomLevel = (region: { latitudeDelta: number }) => {
        // Calcule un niveau de zoom approximatif basé sur latitudeDelta
        return Math.log(360 / region.latitudeDelta) / Math.LN2;
    };

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
                onRegionChange={handleRegionChange}
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

                {locations.points.map((point: { id: number; latitude: number; longitude: number; type: number; dataId: number; minZoom: number; }) => (
                    // On n'affiche que les Markers si le niveau de zoom est supérieur à 12

                    <Marker
                        key={point.id}
                        coordinate={{
                            latitude: point.latitude,
                            longitude: point.longitude,
                        }}
                        title={point.type.toString()}
                        description={point.id.toString()}
                    />

                ))}

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