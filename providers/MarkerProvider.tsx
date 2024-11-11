import React, { createContext, useState, ReactNode, useRef, useEffect } from 'react';
import { IFile, IMessage } from '~/types/MarkerInterfaces';

import { IUser } from '~/types/UserInterfaces';
import { useAuth } from './AuthProvider';
import { useMap } from './MapProvider';
import { randomUUID } from 'expo-crypto';

import awsConfig from '~/config/awsConfig';
import { useMutation, useQuery, } from '@apollo/client';
import { useSubscription } from '@apollo/client';
import { ON_NEW_MESSAGE } from '~/services/graphql/Subscriptions';
import { GET_MESSAGES } from '~/services/graphql/Queries';
import { SEND_MESSAGE } from '~/services/graphql/Mutations';

interface MarkerContextProps {
    message: string;
    messages: IMessage[];
    participants: IUser[];
    isLoading: boolean;
    file: IFile | null;
    setMessage: (message: string) => void;
    setMessages: (messages: IMessage[]) => void;
    setParticipants: (participants: IUser[]) => void;
    setFile: (file: IFile) => void;
    sendMessage: () => void;
    sendSticker: () => void;
}

const MarkerContext = createContext<MarkerContextProps | undefined>(undefined);

export const MarkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const ws = useRef<WebSocket | null>(null);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [file, setFile] = useState<IFile | null>(null);
    const [participants, setParticipants] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);


    const { user } = useAuth();
    const { selectedMarker } = useMap();

    const markerId = selectedMarker?.markerId;

    // Chargement des messages
    const { loading, error: queryError, data: queryData, refetch } = useQuery(GET_MESSAGES, {
        variables: { markerId },
        skip: true, // Évite l'exécution immédiate de la requête
    });

    useEffect(() => {
        if (markerId) {
            // Exécute la requête à chaque changement de markerId
            refetch({ markerId }).then(response => {
                if (response.data) {
                    setMessages(response.data.getMessages);
                }
            }).catch(error => {
                console.error('Error fetching messages:', error.message);
            });
        }
    }, [markerId, refetch]);


    // Subscription pour les nouveaux messages en temps réel
    useSubscription(ON_NEW_MESSAGE, {
        variables: { markerId },
        onData: ({ data }) => {
            if (data && data.data.onNewMessage) {
                console.log("New message received:", data.data.onNewMessage);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    data.data.onNewMessage,
                ]);
            }
        },
        onError: (error) => {
            console.error('Error fetching messages:', error.message)
        }
    });


    // Mutation pour envoyer un nouveau message
    const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
        onCompleted: (data) => {
            console.log("Message sent successfully:", data.sendMessage);
            setMessage(''); // Effacer le champ d’entrée après l’envoi du message
        },
        onError: (error) => {
            console.error("Error sending message:", error);
        },
    });

    const sendMessage = () => {
        if (message.trim() === '') return; // Éviter d'envoyer des messages vides

        if (user) {
            sendMessageMutation({
                variables: {
                    markerId,
                    content: message,
                    senderId: user.userId,
                    type: 'message', // ou 'sticker', selon le type de message
                },
            });
        } else {
            console.error('User is not authenticated. Unable to send message.');
        }
    };

    useEffect(() => {
        if (selectedMarker && selectedMarker.markerId) {
            console.log("error", queryError, "data", queryData);
            if (queryData) {
                const dataResponse = queryData.getMessages;
                setMessages(dataResponse);
                //getParticipants(dataResponse);
            } else if (queryError) {
                console.error('Error fetching messages:', queryError.message);
            }
        }
    }, [selectedMarker, queryData, queryError]);



    useEffect(() => {
        // Si l'utilisateur n'est pas connecté ou aucun marqueur n'est sélectionné, ne rien faire
        // if (!user || !selectedMarker) {
        //     return;
        // }

        // // Initialisation de la connexion WebSocket
        // let url = `wss://${awsConfig.apiGateway.websocketApi.id}.execute-api.${awsConfig.region}.amazonaws.com/${awsConfig.apiGateway.stage}?userId=${user?.userId}&markerId=${selectedMarker.markerId}`;
        // console.log("Connecting to WebSocket: ", url);
        // ws.current = new WebSocket(url);

        // // Gérer les messages entrants
        // ws.current.onmessage = (event) => {
        //     const receivedMessage = JSON.parse(event.data);
        //     console.log("Message received: ", receivedMessage);

        //     if (receivedMessage.markerId === selectedMarker?.markerId && receivedMessage.senderInfo.id === user.userId) {
        //         setIsLoading(false);
        //         console.log("Message confirmed as sent by server:", receivedMessage.content);
        //         // Vous pouvez aussi déclencher une mise à jour de l'interface ici pour confirmer l'envoi
        //     }
        //     setParticipants((prevParticipants) => {
        //         if (!prevParticipants.some((participant) => participant.userId === receivedMessage.senderInfo.id)) {
        //             return [...prevParticipants, receivedMessage.senderInfo];
        //         }
        //         return prevParticipants;
        //     });
        //     setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        // };

        // // Gérer la fermeture de la connexion
        // ws.current.onclose = () => {
        //     console.log("WebSocket closed.");
        // };

        // // Fermer la connexion WebSocket à la fin de la session
        // return () => {
        //     ws.current?.close();
        // };
    }, [selectedMarker]); // Ajout de selectedMarker dans les dépendances

    const sendSticker = () => {
        if (checkIfMessageCanBeSent() && file) {
            try {
                const stickerData = {
                    "action": "sendMessage",
                    "messageId": randomUUID(),
                    "content": file.url,
                    "senderInfo": user,
                    "markerId": selectedMarker?.markerId,
                    "type": "sticker"
                };

                ws.current!.send(JSON.stringify(stickerData));
                console.log("Message sent: ", stickerData);
                setIsLoading(true);
            } catch (error) {
                console.error("Failed to send message:", error);
                setIsLoading(false);
            }
            setFile(null);
        }
    };


    // Fonction pour envoyer un message
    // const sendMessage = () => {
    // if (checkIfMessageCanBeSent()) {
    //     try {
    //         const messageData = {
    //             "action": "sendMessage",
    //             "messageId": randomUUID(),
    //             "content": message,
    //             "senderInfo": user,
    //             "markerId": selectedMarker?.markerId,
    //             "type": "message"
    //         };

    //         ws.current!.send(JSON.stringify(messageData));
    //         console.log("Message sent: ", messageData);
    //         setIsLoading(true);
    //         setMessage(""); // Réinitialise le message après envoi
    //     } catch (error) {
    //         console.error("Failed to send message:", error);
    //         setIsLoading(false);
    //     }
    // };
    // };

    const getParticipants = (messages: IMessage[]) => {
        const participantsInfo: IUser[] = messages.map((message) => message.senderInfo!);
        const uniqueParticipantsInfo: IUser[] = participantsInfo.filter((obj, index, self) =>
            index === self.findIndex((t) => (t.userId === obj.userId))
        );
        setParticipants(uniqueParticipantsInfo);
    }

    const checkIfMessageCanBeSent = (): boolean => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Unable to send message.");
            return false
        }

        if (!message.trim()) {
            console.warn("Message is empty. Skipping send.");
            return false;
        }

        if (!user) {
            console.warn("User is not authenticated. Skipping send.");
            return false;
        }

        if (!selectedMarker) {
            console.warn("No marker selected. Skipping send.");
            return false;
        }

        return true;
    }



    return (
        <MarkerContext.Provider value={{ isLoading, message, setMessage, messages, file, setFile, participants, sendMessage, setMessages, setParticipants, sendSticker }}>
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