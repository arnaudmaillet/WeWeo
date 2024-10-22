import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

import Locations from '../data/locations.json';
import Chats from '../data/chats.json';
import { useAuth } from './AuthProvider';
import { ChatProps } from '~/types/ChatInterfaces';
import { PointProps } from '~/types/MapInterfaces';

export interface MapContextProps {
    markers: PointProps[] | null
    category: number;
    setCategory: (value: number) => void;
    displayMarkersForUser: number | null;
    setDisplayMarkersForUser: (value: number | null) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { user } = useAuth();

    const [markers, setMarkers] = useState<PointProps[] | null>(Locations.points);
    const [displayMarkersForUser, setDisplayMarkersForUser] = useState<number | null>(null);
    const [category, setCategory] = useState<number>(1);

    const setByCategory = () => {
        if (displayMarkersForUser === null) {
            if (category === 2) {
                const chatWhereFriendsIn: ChatProps[] = Chats.data.filter((chat: ChatProps) =>
                    chat.participantsIds.some((userId: number) => user?.following.includes(userId))
                );

                const chatMarkers: PointProps[] = Locations.points.filter((point: PointProps) =>
                    chatWhereFriendsIn.some((chat: ChatProps) => chat.id === point.dataId)
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
            const chatWhereFriendIn: ChatProps[] = Chats.data.filter((chat: ChatProps) =>
                chat.participantsIds.some((userId: number) => displayMarkersForUser === userId)
            );
            const chatMarkers: PointProps[] = Locations.points.filter((point: PointProps) =>
                chatWhereFriendIn.some((chat: ChatProps) => chat.id === point.dataId)
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