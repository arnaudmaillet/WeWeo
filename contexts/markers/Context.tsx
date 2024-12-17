import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Animated } from "react-native";
import { MenuType, WindowType } from "~/contexts/windows/types";
import { IAnimatedButton } from "~/types/ButtonInterface";
import { Fontisto } from "@expo/vector-icons";
import { THEME } from "~/constants/constants";
import { useWindow } from "~/contexts/windows/Context"
import { useAuth } from "../AuthProvider";
import { initialMarkerState, markerReducer } from "./reducer";
import { IMarker, IMessage, INewMarker, INewMessage, IUser, MarkerActionType, MarkerState } from "./types";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, DocumentData, GeoPoint, getDoc, getDocs, onSnapshot, orderBy, query, runTransaction, setDoc, updateDoc, where } from "firebase/firestore";
import { firestore } from "~/firebase";
import { ICoordinates } from "~/types/MapInterfaces";
import { FirestoreAction } from "~/types/FirestoreAction";
import { useUser } from "../user/Context";
import { IFriend } from "../user/types";

const MarkerContext = createContext({});

interface MarkerContextProps {
    state: MarkerState
    dotAnimation: Animated.Value
    closeAnimation: Animated.Value
    mapbuttons: IAnimatedButton[]
    isSubscribed: boolean
    isChatBottomWindowShowed: boolean
    setNew: (payload: INewMarker | IMarker | null) => void
    updateNew: (payload: Partial<INewMarker | IMarker>) => void
    setActive: (payload: IMarker | null) => void
    firestoreFetchOwnedBy: (friends: IFriend[]) => Promise<IMarker[]>
    firestoreAdd: () => void
    firestoreManageActiveMessages: (action: FirestoreAction, payload?: INewMessage) => Promise<void>
    firestoreManageActiveSubscription: () => Promise<void>
    firestoreManageActiveViews: (action: FirestoreAction) => Promise<void>
    enteringAnimation: () => Promise<void>
    exitingAnimation: (setActiveWindow: WindowType) => Promise<void>
    setIsChatBottomWindowShowed: (payload: boolean) => void
    getFromFriends: (friends: IFriend) => void
}

const MarkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { user } = useUser();
    const { state: windowState, setActive: setActiveWindow } = useWindow()

    const [state, dispatch] = useReducer(markerReducer, initialMarkerState);
    const [isSubscribed, setIsSubscribed] = useState<boolean>()
    const [isChatBottomWindowShowed, setIsChatBottomWindowShowed] = useState<boolean>(false)
    const [isChatBottomWindowFinished, setIsChatBottomWindowFinished] = useState<boolean>(true)

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

    const setList = (payload: IMarker[]) => {
        dispatch({ type: MarkerActionType.SET, payload: payload });
    }

    const update = (payload: IMarker) => {
        dispatch({ type: MarkerActionType.UPDATE, payload: payload });
    };

    const setNew = (payload: INewMarker | IMarker | null) => {
        dispatch({ type: MarkerActionType.SET_NEW, payload: payload });
    };

    const updateNew = (payload: Partial<INewMarker | IMarker>) => {
        dispatch({ type: MarkerActionType.UPDATE_NEW, payload: payload });
    };

    const setFiltered = (payload: IMarker[]) => {
        dispatch({ type: MarkerActionType.SET_FILTERED, payload: payload });
    }

    const addFiltered = (payload: IMarker) => {
        dispatch({ type: MarkerActionType.ADD_FILTERED, payload: payload });
    }

    const removeFiltered = (payload: IMarker) => {
        dispatch({ type: MarkerActionType.REMOVE_FILTERED, payload: payload });
    }

    const setActive = (payload: IMarker | null) => {
        dispatch({ type: MarkerActionType.SET_ACTIVE, payload: payload });
    };

    const updateActiveLoading = (payload: boolean) => {
        dispatch({ type: MarkerActionType.UPDATE_ACTIVE_LOADING, payload: payload });
    }

    const updateActiveMessages = (payload: IMessage[]) => {
        dispatch({ type: MarkerActionType.UPDATE_ACTIVE_MESSAGES, payload: payload });
    };

    const updateActiveConnections = (payload: IUser[]) => {
        dispatch({ type: MarkerActionType.UPDATE_ACTIVE_CONNECTIONS, payload: payload });
    };

    const updateActiveViews = (payload: number) => {
        dispatch({ type: MarkerActionType.UPDATE_ACTIVE_VIEWS, payload: payload });
    }

    const firestoreFetch = async () => {
        if (!user?.userId) return;

        try {
            const markersCollection = collection(firestore, "markers");
            const publicMarkersQuery = query(markersCollection, where("policy.isPrivate", "==", false));
            let allMarkers = new Map<string, IMarker>();

            const userMarkersSnapshot = await getDocs(markersCollection);
            userMarkersSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const coordinates = data.coordinates;
                allMarkers.set(doc.id, {
                    markerId: doc.id,
                    isLoading: false,
                    connections: null,
                    ...data,
                    coordinates: {
                        lat: coordinates.latitude,
                        long: coordinates.longitude,
                    } as ICoordinates,
                } as IMarker);
            });

            const publicMarkersSnapshot = await getDocs(publicMarkersQuery);
            publicMarkersSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const coordinates = data.coordinates;
                allMarkers.set(doc.id, {
                    markerId: doc.id,
                    subscribedUserIds: data.subscribedUserIds,
                    isLoading: false,
                    connections: null,
                    ...data,
                    coordinates: {
                        lat: coordinates.latitude,
                        long: coordinates.longitude,
                    } as ICoordinates,
                } as IMarker);
            });
            setList(Array.from(allMarkers.values()));
        } catch (error) {
            console.error("Error fetching markers:", error);
        }
    };

    const firestoreFetchFriends = async () => {
        const ownedMarkers: IMarker[] = [];

        if (!user || !user.friends) return
        for (const friend of user.friends) {
            try {
                // Récupérer les markers possédés par chaque ami
                const ownerOfCollection = collection(firestore, "users", friend.userId, "ownerOf");
                const ownerOfSnapshot = await getDocs(ownerOfCollection);

                if (!ownerOfSnapshot.empty) {
                    for (const markerDoc of ownerOfSnapshot.docs) {
                        const markerData = markerDoc.data();

                        // Si markerData contient un champ "markerRef", on résout la référence
                        let markerDetails = markerData;
                        if (markerData.markerRef) {
                            const markerRefSnapshot = await getDoc(markerData.markerRef);
                            if (markerRefSnapshot.exists()) {
                                markerDetails = markerRefSnapshot.data() as DocumentData; // Cast explicite

                            } else {
                                console.warn(`MarkerRef ${markerData.markerRef.id} does not exist.`);
                                continue;
                            }
                        }
                        const coordinates = markerDetails.coordinates;
                        ownedMarkers.push({
                            markerId: markerDoc.id,
                            isLoading: false,
                            connections: null,
                            ...markerDetails,
                            coordinates: {
                                lat: coordinates.latitude,
                                long: coordinates.longitude,
                            } as ICoordinates,
                        } as IMarker);
                    }
                }
            } catch (error) {
                console.error(`Error fetching ownerOf for friend ${friend.userId}:`, error);
            }
        }
        console.log(user.friends)
        setList(ownedMarkers)
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
            setActiveWindow(WindowType.DEFAULT)
            return true;
        } catch (error) {
            console.error("Failed to add marker:", error);
            return false;
        }
    };

    const firestoreManageActiveMessages = async (action: FirestoreAction, payload?: INewMessage) => {
        const messagesCollection = collection(firestore, `markers/${state.active!.markerId}/messages`);

        switch (action) {
            case FirestoreAction.SUBSCRIBE:
                const q = query(messagesCollection, orderBy("createdAt", "asc"));

                const unsubscribeMessages = onSnapshot(q, async (snapshot) => {
                    const onNewMessages = await Promise.all(
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
                    updateActiveMessages(onNewMessages)
                });

                const markerDocRef = doc(firestore, `markers/${state.active!.markerId}`);
                const unsubscribeMarker = onSnapshot(markerDocRef, async (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const markerData = docSnapshot.data();
                        const connectedUserIds = markerData.connectedUserIds || [];
                        const usersData = await Promise.all(
                            connectedUserIds.map(async (userId: string) => {
                                const userDoc = await getDoc(doc(firestore, "users", userId));
                                return userDoc.exists() ? { userId, ...userDoc.data() } : null;
                            })
                        );
                        updateActiveConnections(usersData);
                    }
                });

                return () => {
                    unsubscribeMessages();
                    unsubscribeMarker();
                };
            case FirestoreAction.ADD:
                if (user && state.active?.markerId && payload) {
                    try {
                        const messagesCollection = collection(firestore, `markers/${state.active!.markerId}/messages`);
                        await addDoc(messagesCollection, payload);
                    } catch (error) {
                        console.error("Error sending message:", error);
                    }
                }
            default:
                console.log(`FirestoreAction: ${action} is not implemented`)
                return
        }
    }

    const firestoreManageActiveConnection = (action: FirestoreAction) => {
        switch (action) {
            case FirestoreAction.SUBSCRIBE:
                if (!state.active || !state.active.markerId || !user?.userId) {
                    console.warn("Impossible de gérer la connexion : état ou utilisateur manquant.");
                    return;
                }

                const userRef = doc(firestore, `users/${user.userId}`);
                const connectionsDocRef = doc(
                    firestore,
                    `markers/${state.active.markerId}/connections`,
                    user.userId
                );
                const connectionsCollectionRef = collection(
                    firestore,
                    `markers/${state.active.markerId}/connections`
                );

                const connectUser = async () => {
                    try {
                        await setDoc(connectionsDocRef, {
                            userRef,
                            connectedAt: new Date(),
                        });
                    } catch (error) {
                        console.error("Erreur lors de la connexion :", error);
                    }
                };

                const disconnectUser = async () => {
                    try {
                        await deleteDoc(connectionsDocRef);
                    } catch (error) {
                        console.error("Erreur lors de la déconnexion :", error);
                    }
                };

                const unsubscribe = onSnapshot(connectionsCollectionRef, async (querySnapshot) => {
                    if (!querySnapshot.empty) {
                        const users = await Promise.all(
                            querySnapshot.docs.map(async (doc) => {
                                const userSnapshot = await getDoc(doc.data().userRef);
                                const userData = userSnapshot.exists() ? userSnapshot.data() : {};
                                return { userId: userSnapshot.id, ...(userData as object) } as IUser;
                            })
                        );
                        updateActiveConnections(users)
                    } else {
                        updateActiveConnections([])
                    }
                });

                connectUser();

                return () => {
                    unsubscribe();
                    disconnectUser();
                };
            default:
                console.log(`FirestoreAction: ${action} is not implemented`)
                return
        }
    };

    const firestoreManageActiveSubscription = async () => {
        if (user && state.active!.markerId) {
            setIsSubscribed(!isSubscribed)
            try {
                const markerRef = doc(firestore, "markers", state.active!.markerId);
                const userRef = doc(firestore, "users", user.userId);

                if (isSubscribed) {
                    await updateDoc(markerRef, {
                        subscribedUserIds: arrayRemove(user.userId),
                    });
                    await updateDoc(userRef, {
                        subscribedTo: arrayRemove(state.active!.markerId),
                    });
                } else {
                    await updateDoc(markerRef, {
                        subscribedUserIds: arrayUnion(user.userId),
                    });
                    await updateDoc(userRef, {
                        subscribedTo: arrayUnion(state.active!.markerId),
                    });
                }
            } catch (error) {
                console.error("Erreur lors de l'inscription/désinscription au marqueur:", error);
            }
        }
    };

    const firestoreManageActiveViews = async (action: FirestoreAction) => {
        const viewersCollectionRef = collection(firestore, `markers/${state.active!.markerId}/views`);
        switch (action) {
            case FirestoreAction.GET:
                const snapshot = await getDocs(viewersCollectionRef)
                updateActiveViews(snapshot.size)
                return
            case FirestoreAction.ADD:
                await addDoc(viewersCollectionRef, {
                    userId: user!.userId,
                    viewedAt: new Date().toISOString()
                });
                return
            default:
                console.log(`FirestoreAction: ${action} is not implemented`)
                return
        }
    }

    const getFromFriends = (friends: IFriend[]) => {
        friends.map(friend => {
            console.log(friend)
            friend.ownerOf || [].flat()
        })
    }

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
        switch (windowState.menu) {
            case MenuType.DISCOVER:
                firestoreFetch()
                break
            case MenuType.FRIENDS:
                firestoreFetchFriends()
                break
            default: setList([])
        }
    }, [user?.userId, windowState.menu])

    useEffect(() => {
        if (user && state.active) {
            const manageAsyncTasks = async () => {
                updateActiveLoading(true);
                try {
                    setIsSubscribed(state.active!.subscribedUserIds.includes(user.userId));

                    await Promise.all([
                        firestoreManageActiveMessages(FirestoreAction.SUBSCRIBE),
                        firestoreManageActiveViews(FirestoreAction.ADD),
                    ]);

                    return firestoreManageActiveConnection(FirestoreAction.SUBSCRIBE);
                } catch (error) {
                    console.error("Erreur lors de la gestion des tâches Firestore :", error);
                } finally {
                    updateActiveLoading(false);
                }
            };

            let cleanupFn: (() => void) | undefined;

            manageAsyncTasks()
                .then((cleanup) => {
                    cleanupFn = cleanup;
                })
                .catch((error) => console.error(error));

            return () => { cleanupFn && cleanupFn() };
        }
    }, [state.active?.markerId]);


    return (
        <MarkerContext.Provider value={{
            state,
            dotAnimation,
            closeAnimation,
            mapbuttons,
            isSubscribed,
            isChatBottomWindowShowed,
            isChatBottomWindowFinished,
            setNew,
            updateNew,
            setActive,
            firestoreAdd,
            firestoreFetchFriends,
            firestoreManageActiveMessages,
            firestoreManageActiveSubscription,
            firestoreManageActiveViews,
            enteringAnimation,
            exitingAnimation,
            setIsChatBottomWindowShowed,
            setIsChatBottomWindowFinished,
            getFromFriends
        }}>
            {children}
        </MarkerContext.Provider>
    );
}

const useMarker = () => {
    const context = useContext(MarkerContext);
    if (context === undefined) {
        throw new Error('useNewMarker must be used within a MarkerProvider');
    }
    return context as MarkerContextProps;
}

export { MarkerContextProps, MarkerProvider, useMarker }