import { Animated, Dimensions, StyleSheet, View, Text, LayoutChangeEvent } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
//import { useClusterer } from 'react-native-clusterer';
import haversine from "haversine-distance";

import { IMap } from '../types/MapInterfaces';
import { IMarker, INewMarker, MarkerType } from '../types/MarkerInterfaces';
import { useMap } from '~/contexts/MapProvider';
import NewMarkerModal from './NewMarkerModal';

import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { THEME } from '~/constants/constants';
import { fakeUserLocation } from '~/contexts/AuthProvider';
import { useWindow } from '~/contexts/window/Context';
import { WindowType } from '~/contexts/window/types';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNewMarker } from '~/contexts/NewMarkerProvider';

const Map: React.FC<IMap> = () => {

    const screenDimensions = Dimensions.get('window');

    const { mapRef, markers, newMarker, marker, setNewMarker, setMarker, setCamera } = useMap();
    const { setActiveWindow } = useWindow()
    const { animateMarkersExiting } = useNewMarker()

    const previousMarkersRef = useRef<IMarker[]>([]); // Référence pour stocker les anciens marqueurs

    const [region, setRegion] = useState({
        lat: fakeUserLocation.lat,
        long: fakeUserLocation.long,
        latDelta: 0.0922,
        longDelta: 0.0421,
    });
    const [markerSnap, setMarkerSnap] = useState<IMarker | null>(null); // to recenter the map on the selected point
    const [closestMarker, setClosestMarker] = useState<IMarker | null>(null);
    const [zoomLevel, setZoomLevel] = useState(0);

    const [containerSizes, setContainerSizes] = useState<{ [key: string]: { width: number; height: number } }>({});
    const [iconAnimations, setIconAnimations] = useState<Animated.Value[]>((markers || []).map(() => new Animated.Value(1)));
    const [textAnimations, setTextAnimations] = useState<Animated.Value[]>((markers || []).map(() => new Animated.Value(0)));


    // const [points] = useClusterer(
    //     markers?.map(marker => ({
    //         type: 'Feature',
    //         geometry: {
    //             type: 'Point',
    //             coordinates: [marker.coordinates.long, marker.coordinates.lat],
    //         },
    //         properties: marker,
    //     })) || [],
    //     { width: screenDimensions.width, height: screenDimensions.height },
    //     {
    //         latitude: fakeUserLocation.lat,
    //         longitude: fakeUserLocation.long,
    //         latitudeDelta: 0.0922,
    //         longitudeDelta: 0.0421,
    //     }
    //   );

    const handleTextLayout = (markerId: string, event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSizes(prevSizes => ({
            ...prevSizes,
            [markerId]: {
                width: Math.max(20, width + 5), // Ajustement pour inclure le padding
                height: Math.max(20, height + 5),
            },
        }));
    };

    const [scaleAnimations, setScaleAnimations] = useState<Animated.Value[]>(
        markers?.map(() => new Animated.Value(0)) || []
    ); // Initialiser les animations de scale

    useEffect(() => {
        if (markers) {
            setIconAnimations(prev => [
                ...prev,
                ...markers.slice(prev.length).map(() => new Animated.Value(1)),
            ]);

            setTextAnimations(prev => [
                ...prev,
                ...markers.slice(prev.length).map(() => new Animated.Value(0)),
            ]);

            setScaleAnimations(prev => [
                ...prev,
                ...markers.slice(prev.length).map(() => new Animated.Value(0)),
            ]);
        }
    }, [markers]);

    const animateToClosestMarker = (closestMarkerId: string) => {
        markers && markers.forEach((marker, index) => {
            if (marker.markerId === closestMarkerId) {
                if (iconAnimations[index] && textAnimations[index]) {
                    // Animer pour faire apparaître le texte et disparaître l'icône
                    Animated.parallel([
                        Animated.timing(iconAnimations[index], {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(textAnimations[index], {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }
            } else {
                if (iconAnimations[index] && textAnimations[index]) {
                    // Revenir à l'état d'origine (icône visible et texte invisible)
                    Animated.parallel([
                        Animated.timing(iconAnimations[index], {
                            toValue: 1,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(textAnimations[index], {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }
            }
        });
    };


    const handlePressMarker = (point: IMarker) => {
        if (mapRef.current) {
            mapRef.current.getCamera().then((camera) => {
                setCamera(camera);
            });
            setMarkerSnap(point);
            setMarker(point);
            if (newMarker) {
                animateMarkersExiting(WindowType.CHAT);
            } else {
                setActiveWindow(WindowType.CHAT)
            }
        }
    };

    const handleLongPress = (event: any) => {
        const { coordinate } = event.nativeEvent;

        impactAsync(ImpactFeedbackStyle.Medium) // Haptic feedback

        setNewMarker({
            coordinates: {
                lat: coordinate.latitude,
                long: coordinate.longitude,
            },
            dataType: MarkerType.DEFAULT
        } as INewMarker);
    };

    useEffect(() => {
        if (marker && mapRef.current) {
            setMarkerSnap(marker);
            setClosestMarker(marker);

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
    }, [marker?.markerId]);

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

    const findClosestMarker = (center: { lat: number; lon: number }) => {
        let closest = null;
        let minDistance = Infinity;

        markers && markers.forEach(marker => {
            const distance = haversine(center, {
                lat: marker.coordinates.lat,
                lon: marker.coordinates.long
            });
            if (distance < minDistance) {
                minDistance = distance;
                closest = marker;
            }
        });
        setClosestMarker(closest);
    };

    useEffect(() => {
        if (closestMarker) {
            animateToClosestMarker(closestMarker.markerId);
        }
    }, [closestMarker]);


    return (
        <View style={styles.map}>
            <MapView
                mapType='standard'
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
                onRegionChangeComplete={(region) => setRegion({
                    lat: region.latitude,
                    long: region.longitude,
                    latDelta: region.latitudeDelta,
                    longDelta: region.longitudeDelta,
                })}
                followsUserLocation={true}
                loadingEnabled={true}
                userInterfaceStyle='light'
                zoomEnabled={true}
                onLongPress={handleLongPress}
                onRegionChange={(region) => findClosestMarker({
                    lat: region.latitude,
                    lon: region.longitude
                })}
                pitchEnabled={true}
            >
                <NewMarkerModal />

                {markers &&
                    markers.map((marker: any, index: any) => {
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
                                    <View style={styles.pillInnerContainer}>
                                        <View
                                            style={[
                                                styles.pillInnerContainer,
                                                containerSizes[marker.markerId] || { width: 50, height: 30 }
                                            ]}
                                        >
                                            <Animated.View style={[styles.pillIcon, { opacity: iconAnimations[index] }]}>
                                                <TouchableOpacity onPress={() => handlePressMarker(marker)}>
                                                    <FontAwesome6 name="question" size={16} color={THEME.colors.primary} />
                                                </TouchableOpacity>
                                            </Animated.View>

                                            <Animated.View
                                                onLayout={(event) => handleTextLayout(marker.markerId, event)}
                                                style={[
                                                    styles.pillTextContainer,
                                                    { opacity: textAnimations[index] }
                                                ]}
                                            >
                                                <TouchableOpacity onPress={() => handlePressMarker(marker)}>
                                                    <Text style={styles.pillText}>
                                                        {marker?.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        </View>
                                    </View>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillInnerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillIcon: {
        height: 20,
        width: 20,
        borderRadius: 10,
        backgroundColor: THEME.colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        zIndex: 1,
    },
    pillTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        backgroundColor: THEME.colors.primary,
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    pillText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: THEME.colors.text.white,
        textAlign: 'center',
    },
});
