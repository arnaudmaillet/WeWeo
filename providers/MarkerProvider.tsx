import React, { createContext, useState, ReactNode } from 'react';
import { IMessage } from '~/types/MarkerInterfaces';

import messagesData from '../data/messages.json';
import users from '../data/users.json';
import { IUser } from '~/types/UserInterfaces';

interface MarkerContextProps {
    messages: IMessage[];
    participants: IUser[];
    fetchMessages: (markerId: string) => Promise<void>;
}

const MarkerContext = createContext<MarkerContextProps | undefined>(undefined);

export const MarkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [participants, setParticipants] = useState<IUser[]>([]);

    const fetchMessages = async (markerId: string) => {
        const messages = messagesData.filter((message) => message.markerId === markerId);
        setMessages(messages);
        getParticipants(messages);
    }

    const getParticipants = (messages: IMessage[]) => {
        const participantsIds = messages.map((message) => message.senderId);
        const participants = users.data.filter((user) => participantsIds.includes(user.id));
        setParticipants(participants);
    }


    return (
        <MarkerContext.Provider value={{ messages, participants, fetchMessages }}>
            {children}
        </MarkerContext.Provider>
    );
}

export const useMarker = () => {
    const context = React.useContext(MarkerContext);
    if (context === undefined) {
        throw new Error('useMarker must be used within a MarkerProvider');
    }
    return context;
}