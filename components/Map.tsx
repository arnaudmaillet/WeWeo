import { Dimensions, StyleSheet, View, Text } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { Marker, Region } from 'react-native-maps';
import haversine from "haversine-distance";

import { IMap } from '../types/MapInterfaces';
import { useMap } from '~/contexts/MapProvider';
import NewMarker from './marker/NewMarker';

import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { THEME } from '~/constants/constants';

import { useMarker } from '~/contexts/markers/Context'
import { Image } from 'expo-image';
import { IMarker, MarkerType } from '~/contexts/markers/types';
import { BBox } from 'geojson';

import MapView from "react-native-maps";
import Supercluster, { AnyProps, PointFeature } from 'supercluster';
import useSupercluster from 'use-supercluster';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useWindowStore } from '~/store/useWindowStore';
import { WindowType } from '~/types/windowTypes';

//import KDBush from 'kdbush';

//import { around } from 'geokdbush';

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

const labelSlicing = (label: string, slice: number): string | undefined => {
    if (label.length === 0) return
    if (label.length > slice) {
        return `${label.slice(0, slice)}...`
    } else {
        return label
    }
}

const edgePadding = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
}


const Map: React.FC<IMap> = () => {

    const screenDimensions = Dimensions.get('window');

    const { mapRef, setCamera } = useMap();
    const { set: setWindow } = useWindowStore()
    const {
        state: markerState,
        exitingAnimation: exitingNewMarkerAnimation,
        setNew: setNewMarker,
        setActive: setActiveMarker
    } = useMarker()

    const [region, setRegion] = useState<Region>({
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const [markerSnap, setMarkerSnap] = useState<IMarker | null>(null); // to recenter the map on the selected point
    const [zoom, setZoom] = useState(0);
    const [bounds, setBounds] = useState<BBox>()

    const points: PointFeature<AnyProps>[] = useMemo(() => {
        const markers = markerState.list
        const filteredMarkers = markerState.filteredList
            ? markers.filter(marker => markerState.filteredList!.some(criterion => criterion.markerId === marker.markerId))
            : markers;
        return filteredMarkers.map((marker) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [marker.coordinates.long, marker.coordinates.lat],
            },
            properties: {
                cluster: false,
                payload: marker
            },
        }))
    }, [markerState.list, markerState.filteredList]);

    const getTopMarker = (clusterMarkers: PointFeature<AnyProps>[]) => {
        return clusterMarkers.reduce((prev, current) => prev.properties.payload.subscribedUserIds.length > current.properties.payload.subscribedUserIds.length ? prev : current);
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
                setWindow(WindowType.CHAT)
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

    const onRegionChangeComplete = async (region: Region, _?: object) => {
        setBounds(regionToBoundingBox(region));
        setZoom(calculateZoom(region.latitudeDelta, region.longitudeDelta, screenDimensions.width));
    }

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom,
        options: { radius: 40, maxZoom: 20 }
    });

    useEffect(() => {
        setBounds(regionToBoundingBox(region));
        setZoom(calculateZoom(region.latitudeDelta, region.longitudeDelta, screenDimensions.width)); // Initialise le zoom
    }, []);

    // useEffect(() => {
    //     if (clusters && clusters.length > 0) {
    //         const index = new KDBush(clusters.length)
    //         clusters.forEach((cluster) => {
    //             const [lon, lat] = cluster.geometry.coordinates;
    //             index.add(lon, lat);
    //         });
    //         index.finish();
    //         const closestIds = around(index, region.longitude, region.latitude, 10)
    //         const closestClusters = closestIds.map((id: any) => {
    //             const [lon, lat] = clusters[id].geometry.coordinates;
    //             return { longitude: lon, latitude: lat };
    //         });



    //         console.log(closestClusters)
    //         mapRef.current?.fitToCoordinates(closestClusters, {
    //             edgePadding: edgePadding
    //         });
    //     }
    // }, [markerState.list])


    return (
        <View style={styles.map}>
            <MapView
                mapType='standard'
                ref={mapRef}
                style={styles.map}
                showsUserLocation={true}
                initialRegion={{
                    latitude: 37.7749,
                    longitude: -122.4194,
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
                                onPress={() => handlePressMarker(marker!)}
                            >
                                <Animated.View entering={ZoomIn.springify().duration(300).delay(300).randomDelay()} exiting={ZoomOut}>
                                    <View className='w-[80] max-h-[80] justify-center items-center'>
                                        {
                                            marker.label.length > 0 && <View className='bg-primary/[.9] rounded-md py-[1] px-[4]'>
                                                <Text className='text-xs text-white font-semibold' allowFontScaling={false}>
                                                    {labelSlicing(marker.label, 50)}
                                                </Text>
                                            </View>
                                        }
                                        {
                                            marker.label.length > 0 ?
                                                <View style={{ height: 20, flexDirection: 'row', alignItems: 'flex-end', position: 'absolute', top: 0, transform: [{ translateY: -16 }] }}>
                                                    {marker.icon && <Image source={{ uri: marker.icon }} style={{ height: iconSize, width: iconSize }} contentFit='contain' />}
                                                    <View style={{ backgroundColor: THEME.colors.accent, borderRadius: 8, padding: 2, minWidth: 15, alignItems: 'center' }}>
                                                        <Text style={{ fontSize: 8, fontWeight: 'bold', color: 'grey' }} allowFontScaling={false}>{cluster.point_count}</Text>
                                                    </View>
                                                </View> :
                                                <View className='flex-row items-end'>
                                                    {marker.icon && <Image source={{ uri: marker.icon }} style={{ height: iconSize, width: iconSize }} contentFit='contain' />}
                                                    <View className='absolute rounded-full p-[2] items-center min-w-[15]' style={{ backgroundColor: THEME.colors.accent, transform: [{ translateX: 5 }, { translateY: 5 }] }}>
                                                        <Text style={{ fontSize: 8, fontWeight: 'bold', color: 'grey' }} allowFontScaling={false}>{cluster.point_count}</Text>
                                                    </View>
                                                </View>
                                        }
                                    </View>
                                </Animated.View>
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
                                onPress={() => handlePressMarker(marker!)}
                            >
                                <Animated.View entering={ZoomIn.springify().duration(300).delay(300).randomDelay()} exiting={ZoomOut}>
                                    <View className='w-[80] max-h-[80] justify-center items-center'>
                                        {
                                            marker.label.length > 0 && <View className='bg-primary /[.9] rounded-md py-[1] px-[4]'>
                                                <Text className='text-xs text-white font-semibold' allowFontScaling={false}>
                                                    {labelSlicing(marker.label, 50)}
                                                </Text>
                                            </View>
                                        }
                                        <View className={`${marker.label.length > 0 && 'h-[20] absolute'}`} style={marker.label.length > 0 && { transform: [{ translateY: -13 }] }}>
                                            {marker.icon && <Image source={{ uri: marker.icon }} style={{ height: iconSize, width: iconSize }} contentFit='contain' />}
                                        </View>
                                    </View>
                                </Animated.View>
                            </Marker>
                        );
                    }
                })}
                <NewMarker />
            </MapView >
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
