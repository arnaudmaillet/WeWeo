import { Animated, Dimensions, StyleSheet, View, Text } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MapView, { Camera, Marker } from 'react-native-maps';

import { IMap } from '../types/MapInterfaces';
import { IMarker } from '../types/MarkerInterfaces';
import { useMap } from '~/providers/MapProvider';



const Map: React.FC<IMap> = ({ userLocation, selectedMarker, setSelectedMarker }) => {
    const mapRef = useRef<MapView | null>(null); // Référence à la MapView

    const { markers } = useMap();
    const previousMarkersRef = useRef<IMarker[]>([]); // Référence pour stocker les anciens marqueurs
    const [selectedMarkerSnap, setSelectedMarkerSnap] = useState<IMarker | null>(null); // to recenter the map on the selected point

    // console.log('Type of markers:', typeof markers);
    // console.log('Is markers an array:', Array.isArray(markers));
    // console.log('markers:', markers);
    // console.log('markersMap:', markers && markers.map((marker: IMarker) => marker.id));


    // Créer des animations d'opacité qui seront recréées à chaque changement de markers
    const [opacityAnimations, setOpacityAnimations] = useState(markers && markers.map(() => new Animated.Value(0)));

    // Animation de pulsation pour le point sélectionné
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

    const pitch = 60; // Déclarer la variable pitch
    const [camera, setCamera] = useState<Camera>({
        center: {
            latitude: userLocation.lat,
            longitude: userLocation.long,
        },
        zoom: 0,
        pitch: pitch,
        heading: 0
    });

    const screenDimensions = Dimensions.get('window');

    const handlePressPoint = (point: IMarker) => {
        if (mapRef.current) {
            mapRef.current.getCamera().then((camera) => {
                setCamera(camera);
            });
            setSelectedMarkerSnap(point);
            setSelectedMarker(point);
        }
    }

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
                { duration: 1000 } // Durée de l'animation en millisecondes
            );
        }

        if (!selectedMarker && selectedMarkerSnap && mapRef.current) {
            mapRef.current?.animateCamera({
                center: {
                    latitude: selectedMarkerSnap.coordinates.lat,
                    longitude: selectedMarkerSnap.coordinates.long,
                },
                pitch: camera.pitch,
                heading: camera.heading
            });
        }
    }, [selectedMarker]);


    useEffect(() => {
        // Comparer les nouveaux marqueurs avec les anciens
        const previousMarkers = previousMarkersRef.current;
        const newMarkers = markers?.filter((marker: IMarker) =>
            !previousMarkers.some(prevMarker => prevMarker.id === marker.id)
        );

        // Si de nouveaux marqueurs existent, créer de nouvelles animations d'opacité pour eux
        if (newMarkers && newMarkers.length > 0) {
            const updatedAnimations = markers && markers.map((marker: IMarker, index: number) => {
                // Si le marqueur est nouveau, il commence à opacité 0, sinon on garde l'animation existante
                return newMarkers?.some((newMarker: IMarker) => newMarker.id === marker.id)
                    ? new Animated.Value(0)
                    : (opacityAnimations?.[index] ?? new Animated.Value(1));
            });
            setOpacityAnimations(updatedAnimations);
        }

        // Mettre à jour la référence des marqueurs précédents
        if (markers) {
            previousMarkersRef.current = markers;
        }
    }, [markers]);

    // Animation d'opacité progressive avec un délai aléatoire
    useEffect(() => {
        (opacityAnimations ?? []).forEach((animation: Animated.Value, index: number) => {
            const randomDelay = Math.random() * 1000; // Délai aléatoire entre 0 et 1 seconde

            setTimeout(() => {
                // Lancer l'animation d'opacité
                Animated.timing(animation, {
                    toValue: 1, // L'opacité passe à 1
                    duration: 1000, // Durée de l'animation d'opacité
                    useNativeDriver: true,
                }).start();
            }, randomDelay);
        });
    }, [opacityAnimations, markers]);

    return (
        <View style={styles.map}>
            <MapView
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
                    left: screenDimensions.width * 0.05
                }}
                showsPointsOfInterest={false}
            >
                <Marker
                    coordinate={{
                        latitude: userLocation.lat,
                        longitude: userLocation.long,
                    }}
                    title="Vous êtes ici"
                >
                    {/* Custom view for the marker */}
                    <View style={styles.userLocationMaker}>
                        <View style={styles.inneruserLocationMaker} />
                    </View>
                </Marker>

                {markers && markers.map((marker: IMarker, index: number) => {
                    // if (point.dataType === "1") {
                    const firstMessageContent = marker?.label;
                    const displayText = firstMessageContent?.slice(0, 10); // Limiter à 10 caractères

                    return (
                        <Marker
                            key={marker.id}
                            coordinate={{
                                latitude: marker.coordinates.lat,
                                longitude: marker.coordinates.long,
                            }}
                            onPress={() => handlePressPoint(marker)}
                        >
                            {/* Appliquer l'animation de chute et d'opacité */}
                            <Animated.View
                                style={[
                                    styles.markerContainer,
                                    {
                                        opacity: opacityAnimations?.[index] ?? new Animated.Value(1), // Animation d'opacité
                                    },
                                ]}
                            >
                                {/* La pilule avec le texte */}
                                <View style={styles.pillContainer}>
                                    {displayText ? <Text style={styles.pillText}>{displayText}</Text> : null}
                                </View>

                                {/* Le point rouge au centre de la vue */}
                                <Animated.View
                                    style={[
                                        styles.customInnerMarker,
                                        selectedMarker && selectedMarker.id === marker.id && {
                                            transform: [{ scale: pulseAnimation }],
                                        },
                                    ]}
                                />
                            </Animated.View>
                        </Marker>
                    );
                    // } else {
                    //     return null;
                    // }
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
        width: 10,
        height: 10,
        borderRadius: 7.5,
        backgroundColor: 'red', // Le point rouge au centre
        shadowColor: '#fff', // Bordure blanche simulée par une ombre
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 2,
    },
    pillContainer: {
        position: 'absolute',
        backgroundColor: 'white', // Fond blanc pour la "carte"
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20, // Bordure arrondie pour l'effet "pilule"
        borderWidth: 1,
        borderColor: '#ccc', // Bordure légère
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4, // Ombre douce pour donner l'effet de carte
        elevation: 3, // Pour Android, ajout de l'ombre
        bottom: 22, // Positionner la pilule en bas du marqueur
    },
    pillText: {
        fontSize: 12, // Taille du texte
        fontWeight: 'bold', // Texte en gras
        color: '#333', // Couleur sombre pour le texte
    },
});
