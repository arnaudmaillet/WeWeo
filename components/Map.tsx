import { Animated, Dimensions, StyleSheet, View, Text, TextInput } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MapView, { Camera, Marker } from 'react-native-maps';

import { IMap } from '../types/MapInterfaces';
import { IMarker } from '../types/MarkerInterfaces';
import { useMap } from '~/providers/MapProvider';
import NewMarkerModal from './NewMarkerModal';

import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { THEME } from '~/constants/constants';
import { fakeUserLocation } from '~/providers/AuthProvider';

const Map: React.FC<IMap> = () => {

    const screenDimensions = Dimensions.get('window');

    const { mapRef, markers, newMarker, marker, setNewMarker, setMarker, setCamera } = useMap();

    const newMarkerModalRef = useRef<{ animateMarkersExiting: () => void } | null>(null);
    const previousMarkersRef = useRef<IMarker[]>([]); // Référence pour stocker les anciens marqueurs

    const [markerSnap, setMarkerSnap] = useState<IMarker | null>(null); // to recenter the map on the selected point
    const [zoomLevel, setZoomLevel] = useState(0);

    const [scaleAnimations, setScaleAnimations] = useState<Animated.Value[]>(
        markers?.map(() => new Animated.Value(0)) || []
    ); // Initialiser les animations de scale



    const handlePressMarker = (point: IMarker) => {
        if (newMarker) {
            newMarkerModalRef.current?.animateMarkersExiting();
        }

        if (mapRef.current) {
            mapRef.current.getCamera().then((camera) => {
                setCamera(camera);
            });
            setMarkerSnap(point);
            setMarker(point);
        }
    };

    const handleLongPress = (event: any) => {
        const { coordinate } = event.nativeEvent;

        impactAsync(ImpactFeedbackStyle.Medium)

        setNewMarker({
            markerId: Math.random().toString(36).substr(2, 9),
            coordinates: {
                lat: coordinate.latitude,
                long: coordinate.longitude,
            },
            subscribedUserIds: [],
            connectedUserIds: [],
            dataType: 'message',
            minZoom: 15,
            label: '',
        });
    };

    useEffect(() => {
        if (marker && mapRef.current) {
            setMarkerSnap(marker);

            mapRef.current.animateCamera(
                {
                    center: {
                        latitude: marker.coordinates.lat,
                        longitude: marker.coordinates.long,
                    },
                },
                { duration: 1000 }
            );
        }

        if (!marker && markerSnap && mapRef.current) {

            mapRef.current.animateCamera(
                {
                    center: {
                        latitude: markerSnap.coordinates.lat,
                        longitude: markerSnap.coordinates.long,
                    },
                },
                { duration: 1000 }
            );
            setMarkerSnap(null);
        }
    }, [marker]);

    useEffect(() => {
        const previousMarkers = previousMarkersRef.current;
        const newMarkers = markers?.filter((marker: IMarker) =>
            !previousMarkers.some(prevMarker => prevMarker.markerId === marker.markerId)
        );

        if (newMarkers && newMarkers.length > 0) {
            const updatedAnimations = markers?.map((marker, index) =>
                newMarkers.some(newMarker => newMarker.markerId === marker.markerId)
                    ? new Animated.Value(0)
                    : scaleAnimations[index] || new Animated.Value(1)
            );
            setScaleAnimations(updatedAnimations || []);
        }

        if (markers) {
            previousMarkersRef.current = markers;
        }
    }, [markers]);


    useEffect(() => {
        scaleAnimations.forEach((animation, index) => {
            setTimeout(() => {
                Animated.spring(animation, {
                    toValue: 1, // Apparition en zoom
                    friction: 5, // Réglage pour adoucir l’animation
                    tension: 40,
                    useNativeDriver: true,
                }).start();
            }, 0); // Délai aléatoire
        });
    }, [scaleAnimations, markers]);


    return (
        <View style={styles.map}>
            <MapView
                //rotateEnabled={false}
                ref={mapRef}
                style={styles.map}
                showsUserLocation={true}
                initialRegion={{
                    latitude: fakeUserLocation.lat,
                    longitude: fakeUserLocation.long,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                mapPadding={{
                    top: 0,
                    right: screenDimensions.width * 0.05,
                    bottom: marker ? screenDimensions.height * 0.78 : 0,
                    left: screenDimensions.width * 0.05,
                }}
                showsPointsOfInterest={false}
                onLongPress={handleLongPress}
            >
                <NewMarkerModal ref={newMarkerModalRef} />

                {markers &&
                    markers.map((marker, index) => {
                        return (
                            <Marker
                                key={marker.markerId}
                                coordinate={{
                                    latitude: marker.coordinates.lat,
                                    longitude: marker.coordinates.long,
                                }}
                            >
                                <Animated.View
                                    style={[
                                        {
                                            transform: [
                                                { scale: scaleAnimations[index] || new Animated.Value(1) },
                                                {
                                                    translateY: scaleAnimations[index]?.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [-20, 0],
                                                    }) || 0
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <TouchableOpacity style={styles.pillContainer} onPress={() => handlePressMarker(marker)}>
                                        <Text style={styles.pillText}>{marker?.label}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </Marker>
                        );
                    })}
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
    },
    pillContainer: {
        alignItems: 'center', // Centrer le contenu horizontalement
        justifyContent: 'center', // Centrer le contenu verticalement
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: 5,
        borderRadius: 6,
        elevation: 3,
        minWidth: 30, // Largeur minimale pour afficher les courts textes
        maxWidth: 100, // Largeur maximale pour limiter l'expansion
        zIndex: 1,
    },
    pillText: {
        width: '100%',
        fontSize: 11, // Taille du texte
        fontWeight: 'bold', // Texte en gras
        color: THEME.colors.text.white, // Couleur du texte
        paddingTop: 3,
        paddingBottom: 3,
        textAlign: 'center',
    },
});
