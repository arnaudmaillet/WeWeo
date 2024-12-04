import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Animated } from "react-native";
import { WindowType } from "~/contexts/windows/types";
import { IAnimatedButton } from "~/types/ButtonInterface";
import { Fontisto } from "@expo/vector-icons";
import { THEME } from "~/constants/constants";
import { useWindow } from "~/contexts/windows/Context"
import { useAuth } from "../AuthProvider";
import { initialMarkerState, markerReducer } from "./reducer";
import { IMarker, IMessage, INewMarker, MarkerActionType, MarkerState } from "./types";
import { addDoc, arrayRemove, arrayUnion, collection, doc, GeoPoint, getDoc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { firestore } from "~/firebase";
import { ICoordinates } from "~/types/MapInterfaces";
import { IUser } from "~/types/UserInterfaces";

const MarkerContext = createContext({});

export interface MarkerContextProps {
    state: MarkerState
    dotAnimation: Animated.Value
    closeAnimation: Animated.Value
    mapbuttons: IAnimatedButton[]
    participants: IUser[]
    isSubscribed: boolean
    setNew: (marker: INewMarker | IMarker | null) => void
    updateNew: (updatedFields: Partial<INewMarker | IMarker>) => void
    setActive: (marker: IMarker | null) => void
    firestoreAdd: () => void
    firestoreAddActiveMessage: (payload: string) => Promise<void>
    firestoreManageActiveSubscription: () => Promise<void>
    enteringAnimation: () => Promise<void>
    exitingAnimation: (setActiveWindow: WindowType) => Promise<void>
}

export const MarkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { user } = useAuth();
    const { setActive: setActiveWindow } = useWindow()

    const [state, dispatch] = useReducer(markerReducer, initialMarkerState);
    const [participants, setParticipants] = useState<IUser[]>()
    const [isSubscribed, setIsSubscribed] = useState<boolean>()

    const dotAnimation = useRef(new Animated.Value(0)).current;
    const closeAnimation = useRef(new Animated.Value(0)).current;

    const mapbuttons: IAnimatedButton[] = useMemo(() => [
        {
            text: { label: "chat", color: { default: THEME.colors.primary, active: THEME.colors.text.white } },
            icon: { label: "hipchat", size: 10, component: <Fontisto />, color: { default: THEME.colors.primary, active: THEME.colors.text.white } },
            background: { default: THEME.colors.grayscale.main, active: THEME.colors.primary },
            animation: new Animated.Value(0),
        }
    ], []);

    const setNew = (payload: INewMarker | IMarker | null) => {
        dispatch({ type: MarkerActionType.SET_NEW, payload: payload });
    };

    const updateNew = (payload: Partial<INewMarker | IMarker>) => {
        dispatch({ type: MarkerActionType.UPDATE_NEW, payload: payload });
    };

    const setActive = (payload: IMarker | null) => {
        dispatch({ type: MarkerActionType.SET_ACTIVE, payload: payload });
    };

    const updateActiveMessages = (payload: IMessage[]) => {
        dispatch({ type: MarkerActionType.UPDATE_ACTIVE_MESSAGES, payload: payload });
    };

    const firestoreFetch = () => {
        if (!user?.userId) return;

        const markersCollection = collection(firestore, "markers");
        const userMarkersQuery = query(markersCollection, where("policy.show", "array-contains", user.userId));
        const publicMarkersQuery = query(markersCollection, where("policy.isPrivate", "==", false));
        const unsubscribes: (() => void)[] = [];

        let allMarkers = new Map();

        const userMarkersUnsubscribe = onSnapshot(markersCollection, (snapshot) => {
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
            dispatch({ type: MarkerActionType.SET, payload: Array.from(allMarkers.values()) });
        }, (error) => {
            console.error("Error fetching user-specific markers:", error);
        });
        unsubscribes.push(userMarkersUnsubscribe);

        const publicMarkersUnsubscribe = onSnapshot(publicMarkersQuery, (snapshot) => {
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const coordinates = data.coordinates;

                allMarkers.set(doc.id, {
                    markerId: doc.id,
                    subscribedUserIds: data.subscribedUserIds,
                    ...data,
                    coordinates: {
                        lat: coordinates.latitude,
                        long: coordinates.longitude,
                    } as ICoordinates,
                });
            });
            dispatch({ type: MarkerActionType.SET, payload: Array.from(allMarkers.values()) });
        }, (error) => {
            console.error("Error fetching public markers:", error);
        });
        unsubscribes.push(publicMarkersUnsubscribe);

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    };

    const firestoreAdd = async (): Promise<boolean> => {

        if (!user || !state.new) return false;
        try {
            const { coordinates, ...rest } = state.new;
            await addDoc(collection(firestore, "markers"), {
                coordinates: new GeoPoint(coordinates.lat, coordinates.long),
                ...rest,
                minZoom: 15,
                subscribedUserIds: [user.userId],
                connectedUserIds: [],
                senderId: user?.userId!,
                createdAt: new Date().getTime(),
                messages: []
            });

            dispatch({ type: MarkerActionType.SET_NEW, payload: null });
            return true;
        } catch (error) {
            console.error("Failed to add marker:", error);
            return false;
        }
    };

    const firestoreFetchActiveMessages = () => {
        const messagesCollection = collection(firestore, `markers/${state.active!.markerId}/messages`);
        const q = query(messagesCollection, orderBy("createdAt", "asc"));

        const unsubscribeMessages = onSnapshot(q, async (snapshot) => {
            const newMessages = await Promise.all(
                snapshot.docs.map(async (docRef) => {
                    const messageData = docRef.data();
                    const { senderId } = messageData;
                    let userInfo = null;

                    if (senderId) {
                        const userDoc = await getDoc(doc(firestore, "users", senderId));
                        userInfo = userDoc.exists() ? userDoc.data() : null;
                    }

                    const message: IMessage = {
                        messageId: docRef.id,
                        senderInfo: userInfo as IUser,
                        markerId: state.active!.markerId,
                        senderId: senderId,
                        content: messageData.content,
                        type: messageData.type,
                        createdAt: messageData.createdAt,
                    };

                    return message;
                })
            );
            updateActiveMessages(newMessages)
        });

        const markerDocRef = doc(firestore, `markers/${state.active!.markerId}`);
        const unsubscribeMarker = onSnapshot(markerDocRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const markerData = docSnapshot.data();
                const connectedUserIds = markerData.connectedUserIds || [];
                const subscriptionUserIds = markerData.subscriptionUserIds || [];

                const allRelevantUserIds = Array.from(new Set([...connectedUserIds, ...subscriptionUserIds]));

                const usersData = await Promise.all(
                    allRelevantUserIds.map(async (userId) => {
                        const userDoc = await getDoc(doc(firestore, "users", userId));
                        return userDoc.exists() ? { userId, ...userDoc.data() } : null;
                    })
                );

                const validUsers = usersData.filter(user => user !== null);

                setParticipants(validUsers as IUser[]);
            }
        });

        return () => {
            unsubscribeMessages();
            unsubscribeMarker();
        };
    }

    const firestoreAddActiveMessage = async (payload: string) => {
        if (user && state.active?.markerId) {
            const messageData = {
                content: payload,
                senderId: user.userId,
                type: 'message',
                createdAt: new Date().getTime(),
            };

            try {
                const messagesCollection = collection(firestore, `markers/${state.active!.markerId}/messages`);
                await addDoc(messagesCollection, messageData);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };

    const firestoreManageActiveConnection = () => {
        const markerRef = doc(firestore, "markers", state.active!.markerId);

        const connectUser = async () => {
            try {
                await updateDoc(markerRef, {
                    connectedUserIds: arrayUnion(user!.userId),
                });
            } catch (error) {
                console.error("Erreur lors de l'ajout de l'utilisateur aux utilisateurs connectés:", error);
            }
        };

        const disconnectUser = async () => {
            try {
                await updateDoc(markerRef, {
                    connectedUserIds: arrayRemove(user!.userId),
                });
            } catch (error) {
                console.error("Erreur lors de la suppression de l'utilisateur des utilisateurs connectés:", error);
            }
        };

        connectUser();

        return () => {
            disconnectUser();
        };
    };

    const firestoreManageActiveSubscription = async () => {
        if (user && state.active!.markerId) {
            try {
                const markerRef = doc(firestore, "markers", state.active!.markerId);
                setIsSubscribed(!isSubscribed)

                if (isSubscribed) {
                    await updateDoc(markerRef, {
                        subscribedUserIds: arrayRemove(user.userId),
                    });

                    const userRef = doc(firestore, "users", user.userId);

                    await updateDoc(userRef, {
                        subscribedTo: arrayRemove(state.active!.markerId),
                    });
                } else {
                    await updateDoc(markerRef, {
                        subscribedUserIds: arrayUnion(user.userId),
                    });

                    const userRef = doc(firestore, "users", user.userId);
                    await updateDoc(userRef, {
                        subscribedTo: arrayUnion(state.active!.markerId),
                    });
                }
            } catch (error) {
                console.error("Erreur lors de l'inscription/désinscription au marqueur:", error);
            }
        }
    };

    const startAnimation = async (duration: number, toValue: number, callback?: () => void) => {
        Animated.stagger(duration, [
            Animated.spring(dotAnimation, { toValue: toValue, useNativeDriver: true }),
            ...mapbuttons.map(button =>
                Animated.spring(button.animation, { toValue: toValue, useNativeDriver: true })
            ),
            Animated.spring(closeAnimation, { toValue: toValue, useNativeDriver: true }),
        ]).start(() => callback && callback());
    };

    const resetAnimation = () => {
        dotAnimation.setValue(0);
        closeAnimation.setValue(0);
        mapbuttons.forEach(button => button.animation.setValue(0));
    };

    const enteringAnimation = async () => {
        resetAnimation();
        state.new && startAnimation(100, 1)
    };

    const exitingAnimation = async (window: WindowType) => {
        setActiveWindow(window)
        await startAnimation(100, 0, () => resetAnimation())
    };

    useEffect(() => {
        user && firestoreFetch();
    }, [user]);


    useEffect(() => {
        if (user && state.active) {
            setParticipants([])
            setIsSubscribed(state.active.subscribedUserIds.includes(user.userId))
            firestoreFetchActiveMessages()
            firestoreManageActiveConnection()
        }
    }, [state.active?.markerId]);

    return (
        <MarkerContext.Provider value={{
            state,
            dotAnimation,
            closeAnimation,
            mapbuttons,
            participants,
            isSubscribed,
            setNew,
            updateNew,
            setActive,
            firestoreAdd,
            firestoreAddActiveMessage,
            firestoreManageActiveSubscription,
            enteringAnimation,
            exitingAnimation,
        }}>
            {children}
        </MarkerContext.Provider>
    );
}

export const useMarker = () => {
    const context = useContext(MarkerContext);
    if (context === undefined) {
        throw new Error('useNewMarker must be used within a MarkerProvider');
    }
    return context as MarkerContextProps;
}