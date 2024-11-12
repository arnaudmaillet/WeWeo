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

const Map: React.FC<IMap> = ({ userLocation }) => {

    const screenDimensions = Dimensions.get('window');

    const { markers, newMarker, selectedMarker, setNewMarker, setSelectedMarker } = useMap();

    const mapRef = useRef<MapView | null>(null); // Référence à la MapView
    const newMarkerModalRef = useRef<{ animateMarkersExiting: () => void } | null>(null);
    const newMarkerInputRef = useRef<TextInput | null>(null); // Référence à l'input du nouveau marqueur
    const previousMarkersRef = useRef<IMarker[]>([]); // Référence pour stocker les anciens marqueurs

    const [selectedMarkerSnap, setSelectedMarkerSnap] = useState<IMarker | null>(null); // to recenter the map on the selected point
    const [zoomLevel, setZoomLevel] = useState(0);

    const [scaleAnimations, setScaleAnimations] = useState<Animated.Value[]>(
        markers?.map(() => new Animated.Value(0)) || []
    ); // Initialiser les animations de scale


    const pitch = 60;
    const [camera, setCamera] = useState<Camera>({
        center: {
            latitude: userLocation.lat,
            longitude: userLocation.long,
        },
        zoom: 0,
        pitch: pitch,
        heading: 0,
    });

    useEffect(() => {
        if (newMarkerInputRef.current?.focus) {
            setCamera({
                center: {
                    latitude: newMarker!.coordinates.lat,
                    longitude: newMarker!.coordinates.long,
                },
                zoom: 0,
                pitch: pitch,
                heading: 0,
            });
        }
    }, [newMarker]);

    const handlePressMarker = (point: IMarker) => {
        if (newMarker) {
            newMarkerModalRef.current?.animateMarkersExiting();
        }

        if (mapRef.current) {
            mapRef.current.getCamera().then((camera) => {
                setCamera(camera);
            });
            setSelectedMarkerSnap(point);
            setSelectedMarker(point);
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
            dataType: 'message',
            minZoom: 15,
            label: '',
        });
    };

    useEffect(() => {
        if (selectedMarker && mapRef.current) {
            setSelectedMarkerSnap(selectedMarker);

            mapRef.current.animateCamera(
                {
                    center: {
                        latitude: selectedMarker.coordinates.lat,
                        longitude: selectedMarker.coordinates.long,
                    },
                },
                { duration: 1000 }
            );
        }

        if (!selectedMarker && selectedMarkerSnap && mapRef.current) {
            mapRef.current?.animateCamera({
                center: {
                    latitude: selectedMarkerSnap.coordinates.lat,
                    longitude: selectedMarkerSnap.coordinates.long,
                },
                pitch: camera.pitch,
                heading: camera.heading,
            });
        }
    }, [selectedMarker]);

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
                    latitude: userLocation.lat,
                    longitude: userLocation.long,
                    latitudeDelta: userLocation.latDelta,
                    longitudeDelta: userLocation.longDelta,
                }}
                mapPadding={{
                    top: 0,
                    right: screenDimensions.width * 0.05,
                    bottom: selectedMarker ? screenDimensions.height * 0.78 : 0,
                    left: screenDimensions.width * 0.05,
                }}
                showsPointsOfInterest={false}
                onLongPress={handleLongPress}
            >
                {newMarker && <NewMarkerModal ref={newMarkerModalRef} />}

                {markers &&
                    markers.map((marker, index) => {
                        const displayText = marker?.label?.slice(0, 10);
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
                                        styles.markerContainer,
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
                                        {displayText ? (
                                            <Text style={styles.pillText}>{displayText}</Text>
                                        ) : null}
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
    markerContainer: {
        alignItems: 'center', // Centrer le contenu horizontalement
        justifyContent: 'center', // Centrer le contenu verticalement
        zIndex: 1,
    },
    pillContainer: {
        backgroundColor: THEME.colors.background.main,
        paddingHorizontal: 5,
        borderRadius: 6,
        elevation: 3,
        borderWidth: .5,
        borderColor: THEME.colors.text.black,
    },
    pillText: {
        fontSize: 11, // Taille du texte
        fontWeight: 'bold', // Texte en gras
        color: THEME.colors.text.black, // Couleur du texte
        paddingTop: 2,
        paddingBottom: 2,
        textAlign: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
});
