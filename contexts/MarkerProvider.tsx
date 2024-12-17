import React, { createContext, useState, ReactNode, useRef, useEffect } from 'react';
import { IFile, IMessage } from '~/types/MarkerInterfaces';

import { useMap } from './MapProvider';

import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { firestore } from '~/firebase';
import { useUser } from './user/Context';
import { IUser } from './user/types';

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
    subscribe: () => void;
    isSubscribed: boolean;
}

const MarkerContext = createContext<MarkerContextProps | undefined>(undefined);

export const MarkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [file, setFile] = useState<IFile | null>(null);
    const [participants, setParticipants] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);


    const { user } = useUser();
    const { marker } = useMap();

    const markerId = marker?.markerId;

    // Connecter l'utilisateur au marqueur lorsqu'il est sélectionné
    useEffect(() => {
        if (!user || !marker) return;

        const markerRef = doc(firestore, "markers", marker.markerId);

        // Ajouter l'ID de l'utilisateur à `connectedUserIds` lorsque le composant est monté
        const connectUser = async () => {
            try {
                await updateDoc(markerRef, {
                    connectedUserIds: arrayUnion(user.userId),
                });
            } catch (error) {
                console.error("Erreur lors de l'ajout de l'utilisateur aux utilisateurs connectés:", error);
            }
        };

        // Supprimer l'ID de l'utilisateur de `connectedUserIds` lorsque le composant est démonté
        const disconnectUser = async () => {
            try {
                await updateDoc(markerRef, {
                    connectedUserIds: arrayRemove(user.userId),
                });
            } catch (error) {
                console.error("Erreur lors de la suppression de l'utilisateur des utilisateurs connectés:", error);
            }
        };

        // Appeler la fonction pour connecter l'utilisateur
        connectUser();

        // Déconnecter l'utilisateur et arrêter l'écoute lorsque le composant est démonté
        return () => {
            disconnectUser();
        };
    }, [user?.userId, marker]);

    // Écoute des nouveaux messages en temps réel
    useEffect(() => {
        if (!markerId) return;

        const messagesCollection = collection(firestore, `markers/${markerId}/messages`);
        const q = query(messagesCollection, orderBy("createdAt", "asc"));

        // Écouter les modifications en temps réel pour les messages
        const unsubscribeMessages = onSnapshot(q, async (snapshot) => {
            const newMessages = await Promise.all(
                snapshot.docs.map(async (docRef) => {
                    const messageData = docRef.data();
                    const { senderId } = messageData;

                    // Récupérer les informations de l'utilisateur à partir de la collection users
                    let userInfo = null;
                    if (senderId) {
                        const userDoc = await getDoc(doc(firestore, "users", senderId));
                        userInfo = userDoc.exists() ? userDoc.data() : null;
                    }

                    const message: IMessage = {
                        messageId: docRef.id,
                        senderInfo: userInfo as IUser,
                        markerId: markerId,
                        senderId: senderId,
                        content: messageData.content,
                        type: messageData.type,
                        createdAt: messageData.createdAt,
                    };

                    return message;
                })
            );

            setMessages(newMessages);
        });

        // Écouter les modifications en temps réel pour `connectedUserIds` et `subscriptionUserIds`
        const markerDocRef = doc(firestore, `markers/${markerId}`);
        const unsubscribeMarker = onSnapshot(markerDocRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const markerData = docSnapshot.data();
                const connectedUserIds = markerData.connectedUserIds || [];
                const subscriptionUserIds = markerData.subscriptionUserIds || [];

                // Inclure les utilisateurs abonnés même s'ils ne sont pas connectés
                const allRelevantUserIds = Array.from(new Set([...connectedUserIds, ...subscriptionUserIds]));

                // Récupérer les informations des utilisateurs
                const usersData = await Promise.all(
                    allRelevantUserIds.map(async (userId) => {
                        const userDoc = await getDoc(doc(firestore, "users", userId));
                        return userDoc.exists() ? { userId, ...userDoc.data() } : null;
                    })
                );

                // Filtrer les utilisateurs valides (qui existent dans la collection `users`)
                const validUsers = usersData.filter(user => user !== null);

                setParticipants(validUsers as IUser[]);
            }
        });

        // Nettoyer les abonnements lorsque le composant se démonte ou lorsque `markerId` change
        return () => {
            unsubscribeMessages();
            unsubscribeMarker();
        };
    }, [markerId, user?.userId]);

    const sendMessage = async () => {
        if (!user || !markerId || !message.trim()) return;

        const messageData = {
            content: message,
            senderId: user.userId,
            type: 'message',
            createdAt: new Date().getTime(),
        };

        try {
            const messagesCollection = collection(firestore, `markers/${markerId}/messages`);
            await addDoc(messagesCollection, messageData);

            setMessage(''); // Réinitialise le message après envoi
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };


    const sendSticker = async () => {
        if (!user || !markerId || !file) return;

        const stickerData = {
            content: file.url,
            senderId: user.userId,
            type: 'sticker',
            createdAt: new Date().getTime(),
        };

        try {
            const messagesCollection = collection(firestore, `markers/${markerId}/messages`);
            await addDoc(messagesCollection, stickerData);

            setFile(null); // Réinitialise le fichier après envoi
        } catch (error) {
            console.error("Error sending sticker:", error);
        }
    };

    const subscribe = async () => {
        if (!user || !marker) {
            console.error("L'utilisateur ou le marqueur sélectionné est manquant");
            return;
        }

        // here to client side performance
        setIsSubscribed(!isSubscribed);

        try {
            // Référence au document du marqueur
            const markerRef = doc(firestore, "markers", marker.markerId);

            if (isSubscribed) {
                // Désinscrire l'utilisateur
                await updateDoc(markerRef, {
                    subscribedUserIds: arrayRemove(user.userId),
                });

                // Référence au document utilisateur
                const userRef = doc(firestore, "users", user.userId);

                // Retirer l'ID du marqueur de subscribedTo de la collection users
                await updateDoc(userRef, {
                    subscribedTo: arrayRemove(marker.markerId),
                });

                console.log(`L'utilisateur ${user.userId} a été désinscrit du marqueur ${marker.markerId}`);
            } else {
                // Inscrire l'utilisateur
                await updateDoc(markerRef, {
                    subscribedUserIds: arrayUnion(user.userId),
                });

                // Ajouter l'ID du marqueur dans subscribedTo de la collection users
                const userRef = doc(firestore, "users", user.userId);
                await updateDoc(userRef, {
                    subscribedTo: arrayUnion(marker.markerId),
                });

                console.log(`L'utilisateur ${user.userId} est maintenant inscrit au marqueur ${marker.markerId}`);
            }
        } catch (error) {
            console.error("Erreur lors de l'inscription/désinscription au marqueur:", error);
        }
    };


    return (
        <MarkerContext.Provider value={{ isLoading, message, setMessage, messages, file, setFile, participants, sendMessage, setMessages, setParticipants, sendSticker, subscribe, isSubscribed }}>
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