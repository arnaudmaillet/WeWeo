import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

import Locations from '../data/locations.json';
import Chats from '../data/chats.json';
import { useAuth } from './AuthProvider';
import { IChat } from '~/types/ChatInterfaces';
import { IPoint } from '~/types/MapInterfaces';

export interface MapContextProps {
    markers: IPoint[] | null
    category: number;
    setCategory: (value: number) => void;
    displayMarkersForUser: string | null;
    setDisplayMarkersForUser: (value: string | null) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { user } = useAuth();

    const [markers, setMarkers] = useState<IPoint[] | null>(Locations.points);
    const [displayMarkersForUser, setDisplayMarkersForUser] = useState<string | null>(null);
    const [category, setCategory] = useState<number>(1);

    const setByCategory = () => {
        if (displayMarkersForUser === null) {
            if (category === 2) {
                const chatWhereFriendsIn: IChat[] = Chats.data.filter((chat: IChat) =>
                    chat.participantsIds.some((userId: string) => user?.following.includes(userId))
                );

                const chatMarkers: IPoint[] = Locations.points.filter((point: IPoint) =>
                    chatWhereFriendsIn.some((chat: IChat) => chat.id === point.dataId)
                );

                setMarkers(chatMarkers);
            } else {
                setMarkers(Locations.points);
            }
        }
    }


    useEffect(() => {
        setByCategory();
    }, [category]);

    useEffect(() => {
        if (displayMarkersForUser) {
            const chatWhereFriendIn: IChat[] = Chats.data.filter((chat: IChat) =>
                chat.participantsIds.some((userId: string) => displayMarkersForUser === userId)
            );
            const chatMarkers: IPoint[] = Locations.points.filter((point: IPoint) =>
                chatWhereFriendIn.some((chat: IChat) => chat.id === point.dataId)
            );
            setMarkers(chatMarkers);
        } else {
            setByCategory();
        }
    }, [displayMarkersForUser]);

    useEffect(() => {
        if (!user) {
            setMarkers(null);
            setCategory(1);
            setDisplayMarkersForUser(null);
        } else {
            setMarkers(Locations.points);
        }
    }, [user]);

    return (
        <MapContext.Provider value={{ markers, category, setCategory, displayMarkersForUser, setDisplayMarkersForUser }}>
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