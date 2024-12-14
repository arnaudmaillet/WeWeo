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

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useMarker } from '~/contexts/markers/Context'
import { Image } from 'expo-image';
import { IMarker, MarkerType } from '~/contexts/markers/types';
import { BBox, Feature, GeoJsonProperties, Point } from 'geojson';

//import MapView from "react-native-map-clustering";
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
    const { state: windowState, setActive: setActiveWindow } = useWindow()
    const {
        state: markerState,
        exitingAnimation: exitingNewMarkerAnimation,
        setNew: setNewMarker,
        setActive: setActiveMarker
    } = useMarker()

    const previousMarkersRef = useRef<IMarker[]>([]); // Référence pour stocker les anciens marqueurs

    // const [region, setRegion] = useState({
    //     lat: fakeUserLocation.lat,
    //     long: fakeUserLocation.long,
    //     latDelta: 0.0922,
    //     longDelta: 0.0421,
    // });

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

    const [containerSizes, setContainerSizes] = useState<{ [key: string]: { width: number; height: number } }>({});
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
        setBounds(regionToBoundingBox(region)); // Initialise les bounds
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
                mapPadding={{
                    top: markerState.active ? screenDimensions.height * 0.70 : 0,
                    right: screenDimensions.width * 0.05,
                    bottom: 0,
                    left: screenDimensions.width * 0.05,
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
                        return (
                            <Marker
                                key={`cluster-${point.properties.cluster_id}`}
                                coordinate={{ latitude: coordinates[1], longitude: coordinates[0] }}
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
                                    <View
                                        style={[
                                            styles.pillInnerContainer,
                                            containerSizes[marker.markerId] || { width: 50, height: 30 }
                                        ]}
                                    >
                                        {
                                            marker.icon ?
                                                <Animated.View style={[{ opacity: iconAnimations[index] }]}>
                                                    <TouchableOpacity
                                                        onPress={() => handlePressMarker(marker!)}
                                                    ><Image source={{ uri: marker.icon }} style={styles.sticker} contentFit='contain' />
                                                    </TouchableOpacity>
                                                </Animated.View> :
                                                <Animated.View
                                                    //onLayout={(event) => handleTextLayout(marker!.markerId, event)}
                                                    style={[
                                                        styles.pillTextContainer,
                                                        { opacity: textAnimations[index] }
                                                    ]}
                                                >
                                                    <TouchableOpacity
                                                        onPress={() => handlePressMarker(marker!)}
                                                    >
                                                        <Text style={styles.pillText}>
                                                            {marker.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </Animated.View>
                                        }
                                    </View>
                                </Animated.View>
                            </Marker>
                        );
                    } else {
                        marker = point.properties.payload as IMarker
                        return (
                            <Marker
                                key={marker.markerId}
                                coordinate={{
                                    latitude: coordinates[1],
                                    longitude: coordinates[0]
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
                                    <View
                                        style={[
                                            styles.pillInnerContainer,
                                            containerSizes[marker.markerId] || { width: 50, height: 30 }
                                        ]}
                                    >
                                        {
                                            marker.icon ? <Animated.View style={[{ opacity: iconAnimations[index] }]}>
                                                <TouchableOpacity
                                                    onPress={() => handlePressMarker(marker!)}
                                                ><Image source={{ uri: marker.icon }} style={styles.sticker} contentFit='contain' />
                                                </TouchableOpacity>
                                            </Animated.View> : <Animated.View
                                                // onLayout={(event) => handleTextLayout(marker.markerId, event)}
                                                style={[
                                                    styles.pillTextContainer,
                                                    { opacity: textAnimations[index] }
                                                ]}
                                            >
                                                <TouchableOpacity
                                                    onPress={() => handlePressMarker(marker!)}
                                                >
                                                    <Text style={styles.pillText}>
                                                        {marker.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        }
                                    </View>
                                </Animated.View>
                            </Marker>
                        );
                    }
                })}
                <NewMarker />
            </MapView>
        </View >
    );
};

// const Map: React.FC<IMap> = () => {

//     const screenDimensions = Dimensions.get('window');

//     const { mapRef, setCamera } = useMap();
//     const superClusterRef = useRef(null);
//     const [clustersReady, setClustersReady] = useState<boolean>(false)
//     const { state: windowState, setActive: setActiveWindow } = useWindow()
//     const {
//         state: markerState,
//         exitingAnimation: exitingNewMarkerAnimation,
//         setNew: setNewMarker,
//         setActive: setActiveMarker
//     } = useMarker()

//     const previousMarkersRef = useRef<IMarker[]>([]); // Référence pour stocker les anciens marqueurs

//     const [region, setRegion] = useState({
//         lat: fakeUserLocation.lat,
//         long: fakeUserLocation.long,
//         latDelta: 0.0922,
//         longDelta: 0.0421,
//     });
//     const [markerSnap, setMarkerSnap] = useState<IMarker | null>(null); // to recenter the map on the selected point
//     const [closestMarker, setClosestMarker] = useState<IMarker | null>(null);
//     const [zoomLevel, setZoomLevel] = useState(0);

//     const [containerSizes, setContainerSizes] = useState<{ [key: string]: { width: number; height: number } }>({});
//     const [iconAnimations, setIconAnimations] = useState<Animated.Value[]>((markerState.list || []).map(() => new Animated.Value(1)));
//     const [textAnimations, setTextAnimations] = useState<Animated.Value[]>((markerState.list || []).map(() => new Animated.Value(0)));

//     const points = useMemo(() => markerState.list.map((marker) => ({
//         type: 'Feature',
//         geometry: {
//             type: 'Point',
//             coordinates: [marker.coordinates.long, marker.coordinates.lat],
//         },
//         properties: {
//             originalData: marker,
//             point_count: 0, // Laissez SuperCluster gérer ses propres champs
//         },
//     })), [markerState.list]);


//     const handleTextLayout = (markerId: string, event: LayoutChangeEvent) => {
//         const { width, height } = event.nativeEvent.layout;
//         setContainerSizes(prevSizes => ({
//             ...prevSizes,
//             [markerId]: {
//                 width: Math.max(20, width + 5), // Ajustement pour inclure le padding
//                 height: Math.max(20, height + 5),
//             },
//         }));
//     };

//     const [scaleAnimations, setScaleAnimations] = useState<Animated.Value[]>(
//         markerState.list.map(() => new Animated.Value(0)) || []
//     ); // Initialiser les animations de scale

//     useEffect(() => {
//         if (markerState.list) {
//             setIconAnimations(prev => [
//                 ...prev,
//                 ...markerState.list.slice(prev.length).map(() => new Animated.Value(1)),
//             ]);

//             setTextAnimations(prev => [
//                 ...prev,
//                 ...markerState.list.slice(prev.length).map(() => new Animated.Value(0)),
//             ]);

//             setScaleAnimations(prev => [
//                 ...prev,
//                 ...markerState.list.slice(prev.length).map(() => new Animated.Value(0)),
//             ]);
//         }
//     }, [markerState.list]);

//     const animateToClosestMarker = (closestMarkerId: string) => {
//         markerState.list.forEach((marker: IMarker, index: number) => {
//             if (marker.markerId === closestMarkerId && marker.label.length > 0) {
//                 if (iconAnimations[index] && textAnimations[index]) {
//                     // Animer pour faire apparaître le texte et disparaître l'icône
//                     Animated.parallel([
//                         Animated.timing(iconAnimations[index], {
//                             toValue: 0,
//                             duration: 300,
//                             useNativeDriver: true,
//                         }),
//                         Animated.timing(textAnimations[index], {
//                             toValue: 1,
//                             duration: 300,
//                             useNativeDriver: true,
//                         }),
//                     ]).start();
//                 }
//             } else {
//                 if (iconAnimations[index] && textAnimations[index]) {
//                     // Revenir à l'état d'origine (icône visible et texte invisible)
//                     Animated.parallel([
//                         Animated.timing(iconAnimations[index], {
//                             toValue: 1,
//                             duration: 300,
//                             useNativeDriver: true,
//                         }),
//                         Animated.timing(textAnimations[index], {
//                             toValue: 0,
//                             duration: 300,
//                             useNativeDriver: true,
//                         }),
//                     ]).start();
//                 }
//             }
//         });
//     };

//     const handlePressMarker = (point: IMarker) => {
//         if (mapRef.current) {
//             mapRef.current.getCamera().then((camera) => {
//                 setCamera(camera);
//             });
//             setMarkerSnap(point);
//             setActiveMarker(point);
//             if (markerState.new) {
//                 exitingNewMarkerAnimation(WindowType.CHAT);
//             } else {
//                 setActiveWindow(WindowType.CHAT)
//             }
//         }
//     };

//     const handleLongPress = (event: any) => {
//         const { coordinate } = event.nativeEvent;

//         impactAsync(ImpactFeedbackStyle.Medium) // Haptic feedback

//         setNewMarker({
//             coordinates: {
//                 lat: coordinate.latitude,
//                 long: coordinate.longitude,
//             },
//             type: MarkerType.DEFAULT,
//             icon: "https://wewe-files.s3.eu-west-3.amazonaws.com/stickers/sticker3.gif",
//             policy: {
//                 isPrivate: false,
//                 show: []
//             },
//             label: ""
//         });
//     };

//     useEffect(() => {
//         if (superClusterRef.current && points.length > 0) {
//             setTimeout(() => {
//                 console.log("Simulating delayed load of points");
//                 //@ts-ignore
//                 superClusterRef.current.load(points);
//                 setClustersReady(true);
//             }, 1000); // Délai de 1 seconde
//         }
//     }, [points]);

//     useEffect(() => {
//         if (markerState.active && mapRef.current) {
//             setMarkerSnap(markerState.active);

//             mapRef.current.animateCamera(
//                 {
//                     center: {
//                         latitude: markerState.active.coordinates.lat,
//                         longitude: markerState.active.coordinates.long,
//                     },
//                 },
//                 { duration: 300 }
//             );
//         }


//         if (!markerState.active && markerSnap && mapRef.current) {

//             mapRef.current.animateCamera(
//                 {
//                     center: {
//                         latitude: markerSnap.coordinates.lat,
//                         longitude: markerSnap.coordinates.long,
//                     },
//                 },
//                 { duration: 300 }
//             );
//             setMarkerSnap(null);
//         }
//     }, [markerState.active?.markerId]);

//     useEffect(() => {
//         const previousMarkers = previousMarkersRef.current;
//         const newMarkers = markerState.list.filter((marker: IMarker) =>
//             !previousMarkers.some(prevMarker => prevMarker.markerId === marker.markerId)
//         );

//         if (newMarkers && newMarkers.length > 0) {
//             const updatedAnimations = markerState.list.map((marker: IMarker, index: number) =>
//                 newMarkers.some(newMarker => newMarker.markerId === marker.markerId)
//                     ? new Animated.Value(0)
//                     : scaleAnimations[index] || new Animated.Value(1)
//             );
//             setScaleAnimations(updatedAnimations || []);
//         }

//         if (markerState.list) {
//             previousMarkersRef.current = markerState.list;
//         }
//     }, [markerState.list]);


//     useEffect(() => {
//         scaleAnimations.forEach((animation, index) => {
//             setTimeout(() => {
//                 Animated.spring(animation, {
//                     toValue: 1, // Apparition en zoom
//                     friction: 5, // Réglage pour adoucir l’animation
//                     tension: 40,
//                     useNativeDriver: true,
//                 }).start();
//             }, 0); // Délai aléatoire
//         });
//     }, [scaleAnimations, markerState.list]);

//     const findClosestMarker = (center: { lat: number; lon: number }) => {
//         let closest: IMarker | null = null;
//         let minDistance = Infinity;

//         markerState.list.forEach((marker: IMarker) => {
//             const distance = haversine(center, {
//                 lat: marker.coordinates.lat,
//                 lon: marker.coordinates.long
//             });
//             if (distance < minDistance) {
//                 minDistance = distance;
//                 closest = marker;
//             }
//         });
//         setClosestMarker(closest);
//     };

//     useEffect(() => {
//         if (closestMarker) {
//             if (windowState.active === WindowType.CHAT && closestMarker.markerId !== markerState.active?.markerId) {
//                 impactAsync(ImpactFeedbackStyle.Light)
//                 setActiveMarker(closestMarker)
//             }
//             animateToClosestMarker(closestMarker.markerId);
//         }
//     }, [closestMarker]);

//     const getClusterMarkers = (clusterId: number) => {
//         if (superClusterRef.current) {
//             //@ts-ignore
//             const children = superClusterRef.current.getLeaves(clusterId, Infinity);
//             console.log("Children: ", JSON.stringify(children));
//             //@ts-ignore
//             return children.map((child: { properties: any }) => child.properties.originalData || {});
//         }
//         return [];
//     };

//     // Fonction pour trouver le marqueur avec le plus grand nombre d'abonnés
//     const getTopMarker = (clusterMarkers: any[]) => {
//         return clusterMarkers.reduce((prev, current) => {
//             return prev.subscribers > current.subscribers ? prev : current;
//         });
//     };

//     return (
//         <View style={styles.map}>
//             <MapView
//                 mapType='standard'
//                 ref={mapRef}
//                 style={styles.map}
//                 showsUserLocation={true}
//                 initialRegion={{
//                     latitude: fakeUserLocation.lat,
//                     longitude: fakeUserLocation.long,
//                     latitudeDelta: 0.0922,
//                     longitudeDelta: 0.0421,
//                 }}
//                 mapPadding={{
//                     top: markerState.active ? screenDimensions.height * 0.70 : 0,
//                     right: screenDimensions.width * 0.05,
//                     bottom: 0,
//                     left: screenDimensions.width * 0.05,
//                 }}
//                 showsPointsOfInterest={false}
//                 followsUserLocation={true}
//                 loadingEnabled={true}
//                 userInterfaceStyle='light'
//                 zoomEnabled={true}
//                 onLongPress={handleLongPress}
//                 onRegionChange={(region) => findClosestMarker({
//                     lat: region.latitude,
//                     lon: region.longitude
//                 })}
//                 pitchEnabled={true}
//                 superClusterRef={superClusterRef}
//                 renderCluster={(item) => {
//                     if (!clustersReady) return null;
//                     console.log("----------------------------------------------------------------")
//                     const clusterId = item.properties.cluster_id;
//                     console.log("ID: ", item.properties.cluster_id)

//                     // Récupérez les marqueurs inclus dans le cluster
//                     const clusterMarkers = getClusterMarkers(clusterId);

//                     if (clusterMarkers.length > 1) {
//                         //@ts-ignore
//                         //console.log("CHILD: ", clusterMarkers)
//                     }
//                     //@ts-ignore
//                     /// console.log("CHILD: ", clusterMarkers)

//                     // Trouvez le marqueur avec le plus d'abonnés
//                     const topMarker = getTopMarker(clusterMarkers);

//                     //@ts-ignore
//                     //console.log("TP: ", topMarker.subscribers)

//                     return (
//                         <Marker coordinate={{
//                             latitude: item.geometry.coordinates[1],
//                             longitude: item.geometry.coordinates[0],
//                         }} key={`cluster-${item.id}`} style={{ height: 100, width: 100, backgroundColor: 'red' }}>
//                             {topMarker && topMarker.subscribers ? (
//                                 <>
//                                     <Text>{`${topMarker.subscribers} abonnés`}</Text>
//                                 </>
//                             ) : (
//                                 <Text>Cluster vide</Text>
//                             )}
//                         </Marker>
//                     )
//                 }}>
//                 <NewMarker />
//                 {points.map((point: {
//                     type: string;
//                     geometry: {
//                         type: string;
//                         coordinates: number[];
//                     };
//                     properties: {
//                         originalData: IMarker;
//                         point_count: number;
//                     };
//                 }, index: any) => {
//                     return (
//                         <Marker
//                             key={point.properties.originalData.markerId}
//                             coordinate={{
//                                 latitude: point.geometry.coordinates[1],
//                                 longitude: point.geometry.coordinates[0]
//                             }}
//                         >
//                             <Animated.View
//                                 style={[
//                                     {
//                                         transform: [
//                                             { scale: scaleAnimations[index] || new Animated.Value(1) },
//                                             {
//                                                 translateY: scaleAnimations[index]?.interpolate({
//                                                     inputRange: [0, 1],
//                                                     outputRange: [-20, 0],
//                                                 }) || 0
//                                             },
//                                         ],
//                                     },
//                                 ]}
//                             >
//                                 <View style={styles.pillInnerContainer}>
//                                     <View
//                                         style={[
//                                             styles.pillInnerContainer,
//                                             containerSizes[point.properties.originalData.markerId] || { width: 50, height: 30 }
//                                         ]}
//                                     >
//                                         <Animated.View style={[styles.pillIcon, { opacity: iconAnimations[index] }]}>
//                                             <TouchableOpacity onPress={() => handlePressMarker(point.properties.originalData as IMarker)}>
//                                                 {
//                                                     point.properties.originalData.icon ? <Image source={{ uri: point.properties.originalData.icon }} style={styles.sticker} contentFit='contain' /> : <FontAwesome6 name="question" size={16} color={THEME.colors.primary} />
//                                                 }
//                                             </TouchableOpacity>
//                                         </Animated.View>

//                                         <Animated.View
//                                             onLayout={(event) => handleTextLayout(point.properties.originalData.markerId, event)}
//                                             style={[
//                                                 styles.pillTextContainer,
//                                                 { opacity: textAnimations[index] }
//                                             ]}
//                                         >
//                                             <TouchableOpacity onPress={() => handlePressMarker(point.properties.originalData as IMarker)}>
//                                                 <Text style={styles.pillText}>
//                                                     {point.properties?.originalData.label}
//                                                 </Text>
//                                             </TouchableOpacity>
//                                         </Animated.View>
//                                     </View>
//                                 </View>
//                             </Animated.View>

//                         </Marker>
//                     );
//                 })}
//             </MapView>
//         </View>
//     );
// };

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
    sticker: {
        width: 50,
        height: 40,
    },
    clusterText: {
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'red',
        padding: 5,
    },
    marker: {
        backgroundColor: 'blue',
        borderRadius: 5,
        padding: 5,
    },
});
