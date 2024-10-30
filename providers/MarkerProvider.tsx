import React, { createContext, useState, ReactNode, useRef, useEffect } from 'react';
import { IMessage } from '~/types/MarkerInterfaces';

import messagesData from '../data/messages.json';
import users from '../data/users.json';
import { IUser } from '~/types/UserInterfaces';
import { useAuth } from './AuthProvider';
import { useMap } from './MapProvider';

import awsConfig from '~/config/awsConfig';

interface MarkerContextProps {
    message: string;
    messages: IMessage[];
    participants: IUser[];
    isLoading: boolean;
    setMessage: (message: string) => void;
    fetchMessages: () => Promise<void>;
    sendMessage: () => void;
}

const MarkerContext = createContext<MarkerContextProps | undefined>(undefined);

export const MarkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const ws = useRef<WebSocket | null>(null);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [participants, setParticipants] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);


    const { user } = useAuth();
    const { selectedMarker } = useMap();


    useEffect(() => {
        // Si l'utilisateur n'est pas connecté ou aucun marqueur n'est sélectionné, ne rien faire
        if (!user || !selectedMarker) {
            return;
        }

        // Initialisation de la connexion WebSocket
        let url = `wss://${awsConfig.apiGateway.websocketApi.id}.execute-api.${awsConfig.region}.amazonaws.com/${awsConfig.apiGateway.stage}?userId=${user?.id}&markerId=${selectedMarker.id}`;
        console.log("Connecting to WebSocket: ", url);
        ws.current = new WebSocket(url);

        // Gérer les messages entrants
        ws.current.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            if (receivedMessage.markerId === selectedMarker?.id && receivedMessage.senderInfo.id === user.id) {
                setIsLoading(false);
                console.log("Message confirmed as sent by server:", receivedMessage.content);
                // Vous pouvez aussi déclencher une mise à jour de l'interface ici pour confirmer l'envoi
            }
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        };

        // Gérer la fermeture de la connexion
        ws.current.onclose = () => {
            console.log("WebSocket closed.");
        };

        // Fermer la connexion WebSocket à la fin de la session
        return () => {
            ws.current?.close();
        };
    }, [selectedMarker]); // Ajout de selectedMarker dans les dépendances


    // Fonction pour envoyer un message
    const sendMessage = () => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Unable to send message.");
            return;
        }

        if (!message.trim()) {
            console.warn("Message is empty. Skipping send.");
            return;
        }

        try {
            const messageData = {
                "action": "sendMessage",
                "content": message,
                "senderInfo": user,
                "markerId": selectedMarker?.id
            };

            ws.current.send(JSON.stringify(messageData));
            console.log("Message sent: ", messageData);
            setIsLoading(true);
            setMessage(""); // Réinitialise le message après envoi
        } catch (error) {
            console.error("Failed to send message:", error);
            setIsLoading(false);
        }
    };
    const fetchMessages = async () => {
        setMessages([]);
        setParticipants([]);
        try {
            const response = await fetch(`https://${awsConfig.apiGateway.restApi.id}.execute-api.${awsConfig.region}.amazonaws.com/${awsConfig.apiGateway.stage}/markers/${selectedMarker?.id}/messages`);
            const data: string = (await response.json()).body;
            const messages = JSON.parse(data);
            setMessages(messages);
            getParticipants(messages);
        } catch (e) {
            console.error("Failed to fetch messages.", e);
        }
    }

    const getParticipants = (messages: IMessage[]) => {
        const participantsInfo: IUser[] = messages.map((message) => message.senderInfo);
        const uniqueParticipantsInfo: IUser[] = participantsInfo.filter((obj, index, self) =>
            index === self.findIndex((t) => (t.id === obj.id))
        );
        setParticipants(uniqueParticipantsInfo);
    }


    return (
        <MarkerContext.Provider value={{ isLoading, message, setMessage, messages, participants, fetchMessages, sendMessage }}>
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