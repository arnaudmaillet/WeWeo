import { Animated, Dimensions, StyleSheet, View, Text, LayoutChangeEvent } from 'react-native';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Marker, Region } from 'react-native-maps';
import haversine from "haversine-distance";

import { IMap } from '../types/MapInterfaces';
import { useMap } from '~/contexts/MapProvider';
import NewMarker from './marker/NewMarker';

import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { THEME } from '~/constants/constants';
import { fakeUserLocation } from '~/contexts/AuthProvider';
import { useWindow } from '~/contexts/windows/Context';
import { WindowType } from '~/contexts/windows/types';

import { useMarker } from '~/contexts/markers/Context'
import { Image } from 'expo-image';
import { IMarker, MarkerType } from '~/contexts/markers/types';
import { BBox } from 'geojson';

import MapView from "react-native-maps";
import Supercluster, { AnyProps, PointFeature } from 'supercluster';
import useSupercluster from 'use-supercluster';

const calculateZoom = (latDelta: number, longDelta: number, screenWidth: number): number => {
    const TILE_SIZE = 256; // Taille de la tuile standard
    const WORLD_WIDTH = TILE_SIZE * (screenWidth / TILE_SIZE); // Largeur effective en pixels pour l'écran
    const ZOOM_MAX = 20;

    const latZoom = Math.log2(360 / latDelta);
    const longZoom = Math.log2(WORLD_WIDTH / longDelta);

    const calculatedZoom = Math.min(latZoom, longZoom, ZOOM_MAX); // Limitez le zoom à une valeur maximale
    return Math.max(0, calculatedZoom); // Limitez le zoom à une valeur minimale de 0
};

const regionToBoundingBox = (region: Region): BBox => {
    let lngD: number;
    if (region.longitudeDelta < 0) lngD = region.longitudeDelta + 360;
    else lngD = region.longitudeDelta;

    return [
        region.longitude - lngD, // westLng - min lng
        region.latitude - region.latitudeDelta, // southLat - min lat
        region.longitude + lngD, // eastLng - max lng
        region.latitude + region.latitudeDelta, // northLat - max lat
    ];
};


const Map: React.FC<IMap> = () => {

    const screenDimensions = Dimensions.get('window');

    const { mapRef, setCamera } = useMap();
    const { setActive: setActiveWindow } = useWindow()
    const {
        state: markerState,
        exitingAnimation: exitingNewMarkerAnimation,
        setNew: setNewMarker,
        setActive: setActiveMarker
    } = useMarker()

    const [region, setRegion] = useState<Region>({
        latitude: fakeUserLocation.lat,
        longitude: fakeUserLocation.long,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const [markerSnap, setMarkerSnap] = useState<IMarker | null>(null); // to recenter the map on the selected point
    const [closestMarker, setClosestMarker] = useState<IMarker | null>(null);
    const [zoom, setZoom] = useState(0);
    const [bounds, setBounds] = useState<BBox>()

    const [iconAnimations, setIconAnimations] = useState<Animated.Value[]>((markerState.list || []).map(() => new Animated.Value(1)));
    const [textAnimations, setTextAnimations] = useState<Animated.Value[]>((markerState.list || []).map(() => new Animated.Value(0)));

    const points: PointFeature<AnyProps>[] = useMemo(() => markerState.list.map((marker) => ({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [marker.coordinates.long, marker.coordinates.lat],
        },
        properties: {
            cluster: false,
            payload: marker
        },
    })), [markerState.list]);

    const getTopMarker = (clusterMarkers: PointFeature<AnyProps>[]) => {
        return clusterMarkers.reduce((prev, current) => prev.properties.payload.subscribedUserIds.length > current.properties.payload.subscribedUserIds.length ? prev : current);
    };

    const [scaleAnimations, setScaleAnimations] = useState<Animated.Value[]>(
        markerState.list.map(() => new Animated.Value(0)) || []
    ); // Initialiser les animations de scale

    // useEffect(() => {
    //     if (markerState.list) {
    //         setIconAnimations(prev => [
    //             ...prev,
    //             ...markerState.list.slice(prev.length).map(() => new Animated.Value(1)),
    //         ]);

    //         setTextAnimations(prev => [
    //             ...prev,
    //             ...markerState.list.slice(prev.length).map(() => new Animated.Value(0)),
    //         ]);

    //         setScaleAnimations(prev => [
    //             ...prev,
    //             ...markerState.list.slice(prev.length).map(() => new Animated.Value(0)),
    //         ]);
    //     }
    // }, [markerState.list]);

    const animateToClosestMarker = (closestMarkerId: string) => {
        markerState.list.forEach((marker: IMarker, index: number) => {
            if (marker.markerId === closestMarkerId && marker.label.length > 0) {
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
            setActiveMarker(point);
            if (markerState.new) {
                exitingNewMarkerAnimation(WindowType.CHAT);
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
            type: MarkerType.DEFAULT,
            icon: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker3.gif",
            policy: {
                isPrivate: false,
                show: []
            },
            label: ""
        });
    };

    // useEffect(() => {
    //     if (markerState.active && mapRef.current) {
    //         setMarkerSnap(markerState.active);

    //         mapRef.current.animateCamera(
    //             {
    //                 center: {
    //                     latitude: markerState.active.coordinates.lat,
    //                     longitude: markerState.active.coordinates.long,
    //                 },
    //             },
    //             { duration: 300 }
    //         );
    //     }


    //     if (!markerState.active && markerSnap && mapRef.current) {

    //         mapRef.current.animateCamera(
    //             {
    //                 center: {
    //                     latitude: markerSnap.coordinates.lat,
    //                     longitude: markerSnap.coordinates.long,
    //                 },
    //             },
    //             { duration: 300 }
    //         );
    //         setMarkerSnap(null);
    //     }
    // }, [markerState.active?.markerId]);

    // useEffect(() => {
    //     const previousMarkers = previousMarkersRef.current;
    //     const newMarkers = markerState.list.filter((marker: IMarker) =>
    //         !previousMarkers.some(prevMarker => prevMarker.markerId === marker.markerId)
    //     );

    //     if (newMarkers && newMarkers.length > 0) {
    //         const updatedAnimations = markerState.list.map((marker: IMarker, index: number) =>
    //             newMarkers.some(newMarker => newMarker.markerId === marker.markerId)
    //                 ? new Animated.Value(0)
    //                 : scaleAnimations[index] || new Animated.Value(1)
    //         );
    //         setScaleAnimations(updatedAnimations || []);
    //     }

    //     if (markerState.list) {
    //         previousMarkersRef.current = markerState.list;
    //     }
    // }, [markerState.list]);

    // useEffect(() => {
    //     scaleAnimations.forEach((animation, index) => {
    //         setTimeout(() => {
    //             Animated.spring(animation, {
    //                 toValue: 1, // Apparition en zoom
    //                 friction: 5, // Réglage pour adoucir l’animation
    //                 tension: 40,
    //                 useNativeDriver: true,
    //             }).start();
    //         }, 0); // Délai aléatoire
    //     });
    // }, [scaleAnimations, markerState.list]);

    const findClosestMarker = (center: { lat: number; lon: number }) => {
        let closest: IMarker | null = null;
        let minDistance = Infinity;

        markerState.list.forEach((marker: IMarker) => {
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

    // useEffect(() => {
    //     if (closestMarker) {
    //         if (windowState.active === WindowType.CHAT && closestMarker.markerId !== markerState.active?.markerId) {
    //             impactAsync(ImpactFeedbackStyle.Light)
    //             setActiveMarker(closestMarker)
    //         }
    //         animateToClosestMarker(closestMarker.markerId);
    //     }
    // }, [closestMarker]);


    // const handleRegionChangeComplete = (newRegion: {
    //     lat: number;
    //     long: number;
    //     latDelta: number;
    //     longDelta: number;
    // }) => {
    //     setRegion(newRegion);
    //     updateClusters(newRegion);
    // };

    const onRegionChangeComplete = async (region: Region, _?: object) => {
        setBounds(regionToBoundingBox(region));
        setZoom(calculateZoom(region.latitudeDelta, region.longitudeDelta, screenDimensions.width));
    }

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom,
        options: { radius: 50, maxZoom: 20 }
    });

    useEffect(() => {
        setBounds(regionToBoundingBox(region));
        setZoom(calculateZoom(region.latitudeDelta, region.longitudeDelta, screenDimensions.width)); // Initialise le zoom
    }, []);


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
                showsPointsOfInterest={false}
                followsUserLocation={true}
                loadingEnabled={true}
                userInterfaceStyle='light'
                zoomEnabled={true}
                onLongPress={handleLongPress}
                onRegionChangeComplete={onRegionChangeComplete}
                pitchEnabled={true}
            >
                {clusters && clusters.map((point: PointFeature<AnyProps>, index) => {
                    let marker: IMarker | null = null
                    let cluster: AnyProps | null = null
                    let topMarker: Supercluster.PointFeature<Supercluster.AnyProps> | null = null
                    let coordinates = point.geometry.coordinates

                    if (supercluster && point.properties.cluster) {
                        cluster = point.properties
                        topMarker = getTopMarker(supercluster.getLeaves(cluster.cluster_id as number));
                        marker = topMarker.properties.payload as IMarker
                        const iconSize = marker.label.length > 0 ? 20 : 40
                        return (
                            <Marker
                                key={`cluster-${point.properties.cluster_id}`}
                                coordinate={{ latitude: coordinates[1], longitude: coordinates[0] }}
                            >
                                <TouchableOpacity style={styles.pillInnerContainer} onPress={() => handlePressMarker(marker!)}>
                                    {
                                        marker.label.length > 0 && <View style={styles.pillTextContainer}>
                                            <Text style={styles.pillText}>
                                                {marker.label}
                                            </Text>
                                        </View>
                                    }
                                    {
                                        marker.icon && <View style={marker.label.length > 0 && { position: 'absolute', left: 0, transform: [{ translateX: -20 }] }}>
                                            <Image source={{ uri: marker.icon }} style={{ height: iconSize, width: iconSize }} contentFit='contain' />
                                        </View>
                                    }
                                </TouchableOpacity>
                            </Marker>
                        );
                    } else {
                        marker = point.properties.payload as IMarker
                        const iconSize = marker.label.length > 0 ? 20 : 40
                        return (
                            <Marker
                                key={marker.markerId}
                                coordinate={{
                                    latitude: coordinates[1],
                                    longitude: coordinates[0]
                                }}
                            >
                                <TouchableOpacity style={styles.pillInnerContainer} onPress={() => handlePressMarker(marker!)}>
                                    {
                                        marker.label.length > 0 && <View style={styles.pillTextContainer}>
                                            <Text style={styles.pillText}>
                                                {marker.label}
                                            </Text>
                                        </View>
                                    }
                                    {
                                        marker.icon && <View style={marker.label.length > 0 && { position: 'absolute', left: 0, transform: [{ translateX: -20 }] }}>
                                            <Image source={{ uri: marker.icon }} style={{ height: iconSize, width: iconSize }} contentFit='contain' />
                                        </View>
                                    }
                                </TouchableOpacity>
                            </Marker>
                        );
                    }
                })}
                <NewMarker />
            </MapView>
        </View >
    );
};

export default Map;


const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: '100%',
    },
    pillInnerContainer: {
        maxWidth: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
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
    marker: {
        backgroundColor: 'blue',
        borderRadius: 5,
        padding: 5,
    },
});
