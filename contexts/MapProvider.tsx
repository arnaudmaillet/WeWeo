import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';

import { useAuth } from './AuthProvider';
import { IMarker, INewMarker } from '~/types/MarkerInterfaces';
import { collection, addDoc, onSnapshot, GeoPoint, where, query } from "firebase/firestore";
import { firestore } from '~/firebase';
import MapView, { Camera } from 'react-native-maps';
import { ICoordinates } from '~/types/MapInterfaces';

export interface MapContextProps {
    mapRef: React.MutableRefObject<MapView | null>;
    markers: IMarker[] | null;
    newMarker: INewMarker | IMarker | null;
    category: number;
    marker: IMarker | null;
    displayMarkersForUser: string | null;
    addMarker: (newMarker: IMarker) => Promise<boolean>;
    setNewMarker: (value: INewMarker | IMarker | null) => void;
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
    const [newMarker, setNewMarker] = useState<INewMarker | IMarker | null>(null); // marker being created
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
        if (!user?.userId) return () => { };

        const markersCollection = collection(firestore, "markers");

        // Requête 1 : Marqueurs accessibles à l'utilisateur
        const userMarkersQuery = query(markersCollection, where("policy.show", "array-contains", user.userId));

        // Requête 2 : Marqueurs publics
        const publicMarkersQuery = query(markersCollection, where("policy.isPrivate", "==", false));

        // Stocker les abonnements pour les deux requêtes
        const unsubscribes: (() => void)[] = [];

        // Suivi des marqueurs combinés
        let allMarkers = new Map(); // Utiliser une Map pour éviter les doublons

        // Fonction de mise à jour
        const updateMarkers = () => {
            setMarkers(Array.from(allMarkers.values()));
        };

        // Écoute pour les marqueurs accessibles à l'utilisateur
        const userMarkersUnsubscribe = onSnapshot(userMarkersQuery, (snapshot) => {
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const coordinates = data.coordinates;

                allMarkers.set(doc.id, {
                    markerId: doc.id,
                    ...data,
                    coordinates: {
                        lat: coordinates.latitude,
                        long: coordinates.longitude,
                    },
                });
            });
            updateMarkers();
        }, (error) => {
            console.error("Error fetching user-specific markers:", error);
        });
        unsubscribes.push(userMarkersUnsubscribe);

        // Écoute pour les marqueurs publics
        const publicMarkersUnsubscribe = onSnapshot(publicMarkersQuery, (snapshot) => {
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const coordinates = data.coordinates;

                allMarkers.set(doc.id, {
                    markerId: doc.id,
                    ...data,
                    coordinates: {
                        lat: coordinates.latitude,
                        long: coordinates.longitude,
                    } as ICoordinates,
                });
            });
            updateMarkers();
        }, (error) => {
            console.error("Error fetching public markers:", error);
        });
        unsubscribes.push(publicMarkersUnsubscribe);

        // Retourner une fonction pour désabonner les deux écouteurs
        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    };

    const addMarker = async (newMarker: IMarker): Promise<boolean> => {
        if (!user || !newMarker) return false;
        try {
            const { coordinates, ...rest } = newMarker;

            setNewMarker(null);

            await addDoc(collection(firestore, "markers"), {
                coordinates: new GeoPoint(coordinates.lat, coordinates.long),
                ...rest
            });

            return true;
        } catch (error) {
            console.error('Erreur lors de l’ajout du marker:', error);
            return false;
        }
    };

    return (
        <MapContext.Provider value={{
            mapRef,
            markers,
            newMarker,
            category,
            marker,
            displayMarkersForUser,
            setNewMarker,
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