import { Animated, Dimensions, StyleSheet, View, Text } from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import MapView, { Camera, Marker } from 'react-native-maps';

import { IMap } from '../types/MapInterfaces';
import { IMarker } from '../types/MarkerInterfaces';
import { useMap } from '~/providers/MapProvider';
import NewMarker from './NewMarkerModal';
import NewMarkerModal from './NewMarkerModal';

const _MIN_MARKER_HEIGHT = 10;
const _MAX_MARKER_WIDTH = 100;

const Map: React.FC<IMap> = ({ userLocation }) => {

    const screenDimensions = Dimensions.get('window');

    const { markers, newMarker, selectedMarker, setNewMarker, setSelectedMarker } = useMap();

    const mapRef = useRef<MapView | null>(null); // Référence à la MapView
    const previousMarkersRef = useRef<IMarker[]>([]); // Référence pour stocker les anciens marqueurs

    const [selectedMarkerSnap, setSelectedMarkerSnap] = useState<IMarker | null>(null); // to recenter the map on the selected point
    const [zoomLevel, setZoomLevel] = useState(0);

    const [scaleAnimations, setScaleAnimations] = useState<Animated.Value[]>(
        markers?.map(() => new Animated.Value(0)) || []
    ); // Initialiser les animations de scale

    const pulseAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (selectedMarker) {
            // Démarrer l'animation de pulsation en boucle
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnimation, {
                        toValue: 1.15, // Taille maximale
                        duration: 500, // Durée de l'expansion
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnimation, {
                        toValue: 1, // Retour à la taille initiale
                        duration: 500, // Durée de la contraction
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        } else {
            pulseAnimation.setValue(1); // Réinitialiser si aucun point n'est sélectionné
        }
    }, [selectedMarker]);

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

    const handlePressMarker = (point: IMarker) => {
        if (mapRef.current) {
            mapRef.current.getCamera().then((camera) => {
                setCamera(camera);
            });
            setSelectedMarkerSnap(point);
            setSelectedMarker(point);
        }
    };

    const handleLongPress = useCallback((event: any) => {
        const { coordinate } = event.nativeEvent;

        const newMarker: IMarker = {
            markerId: Math.random().toString(36).substr(2, 9),
            coordinates: {
                lat: coordinate.latitude,
                long: coordinate.longitude,
            },
            dataType: 'message',
            minZoom: 15,
            label: '',
        };
        setNewMarker(newMarker); // Définissez le marqueur actuel comme le "nouveau marqueur"

        // // mapRef.current?.animateCamera(
        // //     {
        // //         center: {
        // //             latitude: coordinate.latitude,
        // //             longitude: coordinate.longitude,
        // //         }
        // //     },
        // //     { duration: 1000 }
        // // );
        // // Réinitialiser et lancer l'animation de scaleX
        // newMarkerScaleX.setValue(0);
        // Animated.spring(newMarkerScaleX, {
        //     toValue: 1, // Fin de l'animation (échelle complète)
        //     friction: 5,
        //     tension: 40,
        //     useNativeDriver: true,
        // })
        //     .start(() => {
        //         newMarkerInputRef.current?.focus(); // Focus sur l'input une fois l'animation terminée
        //     });

    }, []);

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
                {newMarker && <NewMarkerModal />}

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
                                onPress={() => handlePressMarker(marker)}
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
                                    <View style={[styles.pillContainer, { minHeight: _MIN_MARKER_HEIGHT }]}>
                                        {displayText ? (
                                            <Text style={styles.pillText}>{displayText}</Text>
                                        ) : null}
                                    </View>
                                    <Animated.View
                                        style={[
                                            styles.customInnerMarker,
                                            {
                                                width: zoomLevel > 12 ? 7 : 5,
                                                height: zoomLevel > 12 ? 7 : 5,
                                            },
                                            selectedMarker?.markerId === marker.markerId && {
                                                transform: [{ scale: pulseAnimation }],
                                            },
                                        ]}
                                    />
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
        width: 150, // Assurez-vous que la taille est suffisante pour contenir à la fois la pilule et le marqueur
        height: 30,
    },
    customInnerMarker: {
        borderRadius: 7.5,
        backgroundColor: '#0088cc', // Le point rouge au centre
        shadowColor: '#fff', // Bordure blanche simulée par une ombre
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 2,
    },
    pillContainer: {
        position: 'absolute',
        backgroundColor: 'white',
        paddingVertical: 2,
        paddingHorizontal: 5,
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: '#0088cc', // Bordure légère
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        bottom: 15,
        maxWidth: _MAX_MARKER_WIDTH,
        minWidth: 30,
    },
    pillText: {
        fontSize: 9, // Taille du texte
        fontWeight: 'bold', // Texte en gras
        color: '#333', // Couleur sombre pour le texte
        lineHeight: _MIN_MARKER_HEIGHT,
        paddingVertical: 'auto',
        textAlign: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
});
