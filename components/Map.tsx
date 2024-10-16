import { Animated, Dimensions, StyleSheet, View, Text } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MapView, { Camera, Marker } from 'react-native-maps';

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
    locations: {
        points: IPoint[];
    }
    chats: {
        data: any[];
    }
}

const Map: React.FC<MapProps> = ({ locations, userLocation, selectedPoint, setSelectedPoint, chats }) => {
    const mapRef = useRef<MapView | null>(null); // Référence à la MapView
    const [fallAnimations] = useState(locations.points.map(() => new Animated.Value(-100))); // Animation de translation verticale
    const [opacityAnimations] = useState(locations.points.map(() => new Animated.Value(0))); // Animation d'opacité pour chaque point
    const [selectedPointTmp, setSelectedPointTmp] = useState<IPoint | null>(null); // to recenter the map on the selected point

    // Animation de pulsation pour le halo du point sélectionné
    const haloAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (selectedPoint) {
            // Démarrer l'animation de pulsation en boucle pour le halo
            Animated.loop(
                Animated.sequence([
                    Animated.timing(haloAnimation, {
                        toValue: 2, // Taille maximale du halo
                        duration: 1000, // Durée de l'expansion
                        useNativeDriver: true,
                    }),
                    Animated.timing(haloAnimation, {
                        toValue: 1, // Retour à la taille initiale
                        duration: 1000, // Durée de la contraction
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        } else {
            haloAnimation.setValue(1); // Réinitialiser si aucun point n'est sélectionné
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

    const handlePressPoint = (point: IPoint) => {
        if (mapRef.current) {
            mapRef.current.getCamera().then((camera) => {
                setCamera(camera);
            });
            setSelectedPointTmp(point);
            setSelectedPoint(point);
        }
    }

    useEffect(() => {
        if (selectedPoint && mapRef.current) {
            setSelectedPointTmp(selectedPoint);

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

        if (!selectedPoint && selectedPointTmp && mapRef.current) {
            mapRef.current?.animateCamera({
                center: {
                    latitude: selectedPointTmp.latitude,
                    longitude: selectedPointTmp.longitude,
                },
                pitch: camera.pitch,
                heading: camera.heading
            });
        }
    }, [selectedPoint]);

    const getChat = (id: number) => {
        return chats.data.find(chat => chat.id === id);
    }

    // Animation de chute avec rebond et délai aléatoire
    useEffect(() => {
        locations.points.forEach((_, index) => {
            const randomDelay = Math.random() * 1000; // Délai aléatoire entre 0 et 1 seconde

            setTimeout(() => {
                // Lancer l'animation de chute et d'opacité en parallèle
                Animated.parallel([
                    Animated.spring(fallAnimations[index], {
                        toValue: 0, // Revenir à la position initiale
                        useNativeDriver: true,
                        friction: 5, // Ajout d'un effet de rebond
                        tension: 40,
                    }),
                    Animated.timing(opacityAnimations[index], {
                        toValue: 1, // L'opacité passe à 1
                        duration: 500, // Durée de l'animation d'opacité
                        useNativeDriver: true,
                    }),
                ]).start();
            }, randomDelay);
        });
    }, [fallAnimations, opacityAnimations, locations.points]);

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
                    right: selectedPoint ? screenDimensions.width * 0.05 : 0,
                    bottom: selectedPoint ? screenDimensions.height * 0.78 : 0,
                    left: selectedPoint ? screenDimensions.width * 0.05 : 0
                }}
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

                {locations.points.map((point: IPoint, index: number) => {
                    if (point.type === 1) {
                        const chat = getChat(point.dataId);
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
                                            transform: [{ translateY: fallAnimations[index] }],
                                            opacity: opacityAnimations[index], // Animation d'opacité
                                        },
                                    ]}
                                >
                                    {/* La pilule avec le texte */}
                                    <View style={styles.pillContainer}>
                                        {displayText ? <Text style={styles.pillText}>{displayText}</Text> : null}
                                    </View>

                                    {/* Halo animé */}
                                    {selectedPoint && selectedPoint.id === point.id && (
                                        <Animated.View
                                            style={[
                                                styles.halo,
                                                {
                                                    transform: [{ scale: haloAnimation }],
                                                },
                                            ]}
                                        />
                                    )}

                                    {/* Le point rouge au centre de la vue */}
                                    <View style={styles.customInnerMarker} />
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
    },
    halo: {
        position: 'absolute',
        width: 30, // Taille du halo (plus grand que le point rouge)
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 0, 0, 0.3)', // Halo rouge avec transparence
        zIndex: -1, // Mettre derrière le point rouge
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
