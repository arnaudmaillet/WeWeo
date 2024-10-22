import { Animated, Dimensions, StyleSheet, View, Text } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MapView, { Camera, Marker } from 'react-native-maps';

import { MapProps, PointProps } from '../types/MapInterfaces';
import { useMap } from '~/providers/MapProvider';



const Map: React.FC<MapProps> = ({ userLocation, selectedPoint, setSelectedPoint, chats }) => {
    const mapRef = useRef<MapView | null>(null); // Référence à la MapView

    const { markers } = useMap();
    const previousMarkersRef = useRef<PointProps[]>([]); // Référence pour stocker les anciens marqueurs
    const [selectedPointSnap, setSelectedPointSnap] = useState<PointProps | null>(null); // to recenter the map on the selected point

    // Créer des animations d'opacité qui seront recréées à chaque changement de markers
    const [opacityAnimations, setOpacityAnimations] = useState(markers?.map(() => new Animated.Value(0)));

    // Animation de pulsation pour le point sélectionné
    const pulseAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (selectedPoint) {
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
    }, [selectedPoint]);

    const pitch = 60; // Déclarer la variable pitch
    const [camera, setCamera] = useState<Camera>({
        center: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
        },
        zoom: 0,
        pitch: pitch,
        heading: 0
    });

    const screenDimensions = Dimensions.get('window');

    const handlePressPoint = (point: PointProps) => {
        if (mapRef.current) {
            mapRef.current.getCamera().then((camera) => {
                setCamera(camera);
            });
            setSelectedPointSnap(point);
            setSelectedPoint(point);
        }
    }

    useEffect(() => {
        if (selectedPoint && mapRef.current) {
            setSelectedPointSnap(selectedPoint);

            mapRef.current.animateCamera(
                {
                    center: {
                        latitude: selectedPoint.latitude,
                        longitude: selectedPoint.longitude,
                    },
                },
                { duration: 1000 } // Durée de l'animation en millisecondes
            );
        }

        if (!selectedPoint && selectedPointSnap && mapRef.current) {
            mapRef.current?.animateCamera({
                center: {
                    latitude: selectedPointSnap.latitude,
                    longitude: selectedPointSnap.longitude,
                },
                pitch: camera.pitch,
                heading: camera.heading
            });
        }
    }, [selectedPoint]);

    const getChat = (id: number) => {
        return chats.data.find(chat => chat.id === id);
    }

    useEffect(() => {
        // Comparer les nouveaux marqueurs avec les anciens
        const previousMarkers = previousMarkersRef.current;
        const newMarkers = markers?.filter((marker: PointProps) =>
            !previousMarkers.some(prevMarker => prevMarker.id === marker.id)
        );

        // Si de nouveaux marqueurs existent, créer de nouvelles animations d'opacité pour eux
        if (newMarkers && newMarkers.length > 0) {
            const updatedAnimations = markers?.map((marker: PointProps, index: number) => {
                // Si le marqueur est nouveau, il commence à opacité 0, sinon on garde l'animation existante
                return newMarkers?.some((newMarker: PointProps) => newMarker.id === marker.id)
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
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: userLocation.latitudeDelta,
                    longitudeDelta: userLocation.longitudeDelta,
                }}
                mapPadding={{
                    top: 0,
                    right: screenDimensions.width * 0.05,
                    bottom: selectedPoint ? screenDimensions.height * 0.78 : 0,
                    left: screenDimensions.width * 0.05
                }}
                showsPointsOfInterest={false}
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

                {markers?.map((point: PointProps, index: number) => {
                    if (point.type === 1) {
                        const chat = point.dataId !== undefined ? getChat(point.dataId) : null;
                        const firstMessageContent = chat?.messages[0]?.content || ''; // Récupérer le contenu du premier message
                        const displayText = firstMessageContent.slice(0, 10); // Limiter à 10 caractères

                        return (
                            <Marker
                                key={point.id}
                                coordinate={{
                                    latitude: point.latitude,
                                    longitude: point.longitude,
                                }}
                                onPress={() => handlePressPoint(point)}
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
                                            selectedPoint && selectedPoint.id === point.id && {
                                                transform: [{ scale: pulseAnimation }],
                                            },
                                        ]}
                                    />
                                </Animated.View>
                            </Marker>
                        );
                    } else {
                        return null;
                    }
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
