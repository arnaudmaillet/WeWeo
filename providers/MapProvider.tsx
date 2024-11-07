import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

import { useAuth } from './AuthProvider';
import { ICoordinates } from '~/types/MapInterfaces';
import { ChatTypes, IMarker } from '~/types/MarkerInterfaces';
import awsConfig from '~/config/awsConfig';
import { randomUUID } from 'expo-crypto';

export interface MapContextProps {
    markers: IMarker[] | null;
    newMarker: IMarker | null;
    newMarkerType: ChatTypes | null;
    category: number;
    selectedMarker: IMarker | null;
    displayMarkersForUser: string | null;
    addMarker: (marker: IMarker) => Promise<boolean>;
    setNewMarker: (value: IMarker | null) => void;
    setNewMarkerType: (value: ChatTypes | null) => void;
    setCategory: (value: number) => void;
    setSelectedMarker: (value: IMarker | null) => void;
    setDisplayMarkersForUser: (value: string | null) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { user } = useAuth();

    const [markers, setMarkers] = useState<IMarker[] | null>(null); // markers to display on the map
    const [newMarker, setNewMarker] = useState<IMarker | null>(null); // marker being created
    const [newMarkerType, setNewMarkerType] = useState<ChatTypes | null>(null); // type of the new marker
    const [selectedMarker, setSelectedMarker] = useState<IMarker | null>(null); // marker selected by the user
    const [displayMarkersForUser, setDisplayMarkersForUser] = useState<string | null>(null);
    const [category, setCategory] = useState<number>(0);

    const addMarker = async (marker: IMarker): Promise<boolean> => {
        if (!user) return false;
        try {
            const randomID = randomUUID();
            const response = await fetch(`https://11vcne1jhb.execute-api.eu-west-3.amazonaws.com/dev/markers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    markerId: randomID,
                    lat: marker.coordinates.lat,
                    long: marker.coordinates.long,
                    label: marker.label,
                    creatorId: user.id,
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP! status: ${response.status}`);
            }
            setMarkers([...(markers || []), { ...marker, markerId: randomID }]);
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

    useEffect(() => {
        if (!user) {
            setMarkers(null);
            setCategory(1);
            setDisplayMarkersForUser(null);
        } else {
            const fetchMarkers = async () => {
                try {
                    const url = `https://${awsConfig.apiGateway.restApi.id}.execute-api.${awsConfig.region}.amazonaws.com/${awsConfig.apiGateway.stage}/markers`;
                    const response = await fetch(url);
                    const data: string = (await response.json()).body;
                    const mappedData: IMarker[] = JSON.parse(data).map((item: any) => ({
                        markerId: item.markerId,
                        coordinates: {
                            long: parseFloat(item.coordinate.long),
                            lat: parseFloat(item.coordinate.lat)
                        } as ICoordinates,
                        dataType: item.dataType,
                        dataId: item.id,
                        minZoom: parseInt(item.minZoom, 10),
                        label: item.label
                    }));
                    setMarkers(mappedData);
                } catch (error) {
                    console.error('Error fetching rooms:', error);
                }
            };
            fetchMarkers();
            //setMarkers(dummyMarkers);
        }
    }, [user]);

    return (
        <MapContext.Provider value={{
            markers,
            newMarker,
            newMarkerType,
            category,
            selectedMarker,
            displayMarkersForUser,
            setNewMarker,
            setNewMarkerType,
            addMarker,
            setCategory,
            setSelectedMarker,
            setDisplayMarkersForUser
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