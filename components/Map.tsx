import { Dimensions, StyleSheet, View } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import MapView, { Camera, Marker, Region } from 'react-native-maps'

const locations = require('../data/locations.json')

interface ICoordinates {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

interface IPoint {
    id: number;
    latitude: number;
    longitude: number;
    type: number;
    dataId: number;
    minZoom: number;
}

interface MapProps {
    userLocation: ICoordinates;
    selectedPoint: IPoint | null;
    setSelectedPoint: (point: IPoint | null) => void;
    flyTo: ICoordinates;
    setFlyTo: (coordinates: ICoordinates) => void;
}

const Map: React.FC<MapProps> = ({ userLocation, selectedPoint, setSelectedPoint, flyTo, setFlyTo }) => {

    const mapRef = useRef<MapView | null>(null);  // Référence à la MapView
    const [zoomLevel, setZoomLevel] = useState(0);
    const [region, setRegion] = useState<Region>({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: userLocation.latitudeDelta,
        longitudeDelta: userLocation.longitudeDelta,
    });
    const [selectedPreviousPoint, setselectedPreviousPoint] = useState<IPoint | null>(null);
    const pitch = 0; // Declare pitch variable
    const [camera, setCamera] = useState<Camera>({
        center: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
        },
        zoom: 0,
        pitch: pitch,
        heading: 0
    });

    const handleRegionChange = (region: Region) => {
        const zoomLevel = getZoomLevel(region.latitudeDelta);
        setZoomLevel(zoomLevel);
        setRegion(region);
    };

    const getZoomLevel = (latitudeDelta: number) => {
        const angle = latitudeDelta * (Math.PI / 180);
        return Math.round(Math.log(360 / angle) / Math.LN2);
    };

    useEffect(() => {
        if (selectedPoint && mapRef.current) {
            setselectedPreviousPoint(selectedPoint);

            mapRef.current.getCamera().then((camera) => {
                setCamera(camera);
            });

            mapRef.current.animateCamera(
                {
                    center: {
                        latitude: selectedPoint.latitude,
                        longitude: selectedPoint.longitude,
                    },
                    zoom: zoomLevel,
                    pitch: 50,
                },
                { duration: 1000 }  // Durée de l'animation en millisecondes
            );
        }
        if (!selectedPoint && selectedPreviousPoint && mapRef.current) {
            mapRef.current?.animateCamera({
                ...camera,
                center: {
                    latitude: selectedPreviousPoint.latitude,
                    longitude: selectedPreviousPoint.longitude,
                }
            });
        }
    }, [selectedPoint]);

    return (
        <View style={styles.map}>
            <MapView
                ref={mapRef}
                style={styles.map}
                showsUserLocation={true}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: userLocation.latitudeDelta,
                    longitudeDelta: userLocation.longitudeDelta
                }}
                onRegionChange={handleRegionChange}
                mapPadding={
                    {
                        top: 0,
                        right: 0,
                        bottom: selectedPoint ? Dimensions.get('window').height * 0.7 : 0,
                        left: 0
                    }
                }
            >
                <Marker
                    coordinate={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                    }}
                    title="Vous êtes ici"
                >
                    {/* Custom view for the marker */}
                    <View style={styles.userLocationMaker}>
                        <View style={styles.inneruserLocationMaker} />
                    </View>
                </Marker>

                {locations.points.map((point: IPoint) => (
                    zoomLevel >= point.minZoom && point.type === 1 && (
                        <Marker
                            key={point.id}
                            coordinate={{
                                latitude: point.latitude,
                                longitude: point.longitude
                            }}
                            title={point.id.toString()}
                            onPress={() => setSelectedPoint(point)}
                        />
                    )
                ))}

            </MapView>
        </View>
    );
};

export default Map;

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
});
