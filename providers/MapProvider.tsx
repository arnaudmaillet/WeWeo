import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';

import { useAuth } from './AuthProvider';
import { ChatTypes, IMarker } from '~/types/MarkerInterfaces';
import { collection, addDoc, onSnapshot, GeoPoint } from "firebase/firestore";
import { firestore } from '~/firebase';
import MapView, { Camera } from 'react-native-maps';

export interface MapContextProps {
    mapRef: React.MutableRefObject<MapView | null>;
    markers: IMarker[] | null;
    newMarker: IMarker | null;
    newMarkerType: ChatTypes | null;
    category: number;
    marker: IMarker | null;
    displayMarkersForUser: string | null;
    addMarker: () => Promise<boolean>;
    setNewMarker: (value: IMarker | null) => void;
    setNewMarkerType: (value: ChatTypes | null) => void;
    setCategory: (value: number) => void;
    setMarker: (value: IMarker | null) => void;
    setDisplayMarkersForUser: (value: string | null) => void;
    setCamera: (value: Camera) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { user } = useAuth();

    const mapRef = useRef<MapView | null>(null); // Référence à la MapView
    const [markers, setMarkers] = useState<IMarker[] | null>(null); // markers to display on the map
    const [newMarker, setNewMarker] = useState<IMarker | null>(null); // marker being created
    const [newMarkerType, setNewMarkerType] = useState<ChatTypes | null>(null); // type of the new marker
    const [marker, setMarker] = useState<IMarker | null>(null); // marker selected by the user
    const [displayMarkersForUser, setDisplayMarkersForUser] = useState<string | null>(null);
    const [category, setCategory] = useState<number>(0);


    const [camera, setCamera] = useState<Camera>({
        center: {
            latitude: user?.location.lat || 0,
            longitude: user?.location.long || 0,
        },
        zoom: 0,
        pitch: 60,
        heading: 0,
    });

    useEffect(() => {
        if (user) {
            const unsubscribe = fetchMarkers();

            // Arrêter l'observation lorsque le composant est démonté
            return () => unsubscribe();
        } else {
            setMarkers(null);
            setCategory(1);
            setDisplayMarkersForUser(null);
        }
    }, [user]);

    const fetchMarkers = () => {
        const markersCollection = collection(firestore, "markers");

        // Utiliser onSnapshot pour écouter les changements en temps réel dans la collection "markers"
        const unsubscribe = onSnapshot(markersCollection, (snapshot) => {
            const updatedMarkers = snapshot.docs.map(doc => {
                const data = doc.data();
                const coordinates = data.coordinates;

                return {
                    markerId: doc.id,
                    ...data,
                    coordinates: {
                        lat: coordinates.latitude,
                        long: coordinates.longitude,
                    },
                } as IMarker;
            });
            setMarkers(updatedMarkers);
        }, (error) => {
            console.error("Error fetching markers in real-time:", error);
            setMarkers(null);
        });

        // Retourner la fonction de désinscription pour arrêter l'écoute
        return unsubscribe;
    };



    const addMarker = async (): Promise<boolean> => {
        if (!user || !newMarker || !newMarker.label) return false;
        try {
            const markerData = {
                coordinates: new GeoPoint(newMarker.coordinates.lat, newMarker.coordinates.long),
                label: newMarker.label,
                creatorId: user.userId,
                subscribedUserIds: [user.userId],
                connectedUserIds: [],
                minZoom: 15,
                dataType: 'message',
                createdAt: new Date().getTime(),
            }

            setNewMarkerType(null);
            setNewMarker(null);

            await addDoc(collection(firestore, "markers"), markerData);

            return true;
        } catch (error) {
            console.error('Erreur lors de l’ajout du marker:', error);
            return false;
        }
    };


    const setByCategory = () => {
        // if (displayMarkersForUser === null) {
        //     if (category === 2) {
        //         const roomWhereFriendsIn: IMarker[] = Rooms.data.filter((room: IMarker) =>
        //             room.participantsIds.some((userId: string) => user?.following.includes(userId))
        //         );

        //         const roomMarkers: IMarker[] = Locations.filter((point: IMarker) =>
        //             roomWhereFriendsIn.some((room: IRoom) => room.id === point.dataId)
        //         );

        //         setMarkers(roomMarkers);
        //     } else {
        //         setMarkers(Locations);
        //     }
        // }
    }


    useEffect(() => {
        setByCategory();
    }, [category]);

    // useEffect(() => {
    //     if (displayMarkersForUser) {
    //         const roomWhereFriendIn: IRoom[] = Rooms.data.filter((room: IRoom) =>
    //             room.participantsIds.some((userId: string) => displayMarkersForUser === userId)
    //         );
    //         const roomMarkers: IMarker[] = Locations.filter((point: IMarker) =>
    //             roomWhereFriendIn.some((room: IRoom) => room.id === point.dataId)
    //         );
    //         setMarkers(roomMarkers);
    //     } else {
    //         setByCategory();
    //     }
    // }, [displayMarkersForUser]);

    return (
        <MapContext.Provider value={{
            mapRef,
            markers,
            newMarker,
            newMarkerType,
            category,
            marker,
            displayMarkersForUser,
            setNewMarker,
            setNewMarkerType,
            addMarker,
            setCategory,
            setMarker,
            setDisplayMarkersForUser,
            setCamera
        }}>
            {children}
        </MapContext.Provider>
    );
}

export const useMap = (): MapContextProps => {
    const context = useContext(MapContext);
    if (context === undefined) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};