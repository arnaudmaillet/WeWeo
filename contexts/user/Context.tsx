import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { IUser, IFriend, UserActionType } from "~/contexts/user/types";
import { userReducer } from "./reducer";
import { firestore } from "~/firebase";
import { collection, doc, DocumentData, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { FirestoreAction } from "~/types/FirestoreAction";
import { IMarker, IMarkerHistory } from "../markers/types";
import { useMenu } from "../menu/Context";
import { MenuType } from "../menu/types";
import { ICoordinates } from "~/types/MapInterfaces";

interface UserContextProps {
    user: IUser | null;
    set: (user: IUser) => void;
    update: (user: IUser) => void;
    setFriends: (friends: IFriend[]) => void;
    firestoreManageHistory: (action: FirestoreAction, markerId?: string) => Promise<IMarkerHistory[] | void>
    logout: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { setLoading } = useMenu()
    const [user, dispatch] = useReducer(userReducer, null);

    const set = (payload: IUser) => {
        dispatch({ type: UserActionType.SET, payload: payload });
    };

    const update = (payload: IUser) => {
        dispatch({ type: UserActionType.UPDATE, payload: payload });
    };

    const setFriends = (payload: IFriend[]) => {
        dispatch({ type: UserActionType.SET_FRIENDS, payload: payload });
    };

    const setHistory = (payload: IMarkerHistory[]) => {
        dispatch({ type: UserActionType.SET_HISTORY, payload: payload });
    }

    const logout = () => {
        dispatch({ type: UserActionType.LOGOUT });
    };

    const firestoreManageHistory = async (action: FirestoreAction, markerId?: string): Promise<IMarkerHistory[] | void> => {
        if (user) {
            setLoading(MenuType.HISTORY, true)
            switch (action) {
                case FirestoreAction.ADD:
                    if (!markerId) {
                        console.error(`firestoreManageHistory: action ${action} -> markerId value ${markerId} must be not null | undefined`);
                        break
                    }
                    try {
                        const userHistoryCollection = collection(firestore, "users", user.userId, "history");
                        const markerRef = doc(firestore, "markers", markerId!);
                        const historyDocRef = doc(userHistoryCollection, markerId);
                        const historyDocSnapshot = await getDoc(historyDocRef);

                        if (historyDocSnapshot.exists()) {
                            await updateDoc(historyDocRef, {
                                viewedAt: new Date(),
                            });
                        } else {
                            await setDoc(historyDocRef, {
                                markerRef,
                                viewedAt: new Date(),
                            });
                        }
                    } catch (error) {
                        console.error("Erreur lors de la gestion de l'historique des marqueurs:", error);
                    }
                    break;
                case FirestoreAction.FETCH:
                    try {
                        const userHistoryCollection = collection(firestore, "users", user.userId, "history");
                        const querySnapshot = await getDocs(userHistoryCollection);

                        // Récupérer toutes les références à partir de l'historique
                        const markerPromises = querySnapshot.docs.map(async doc => {
                            const markerRef = doc.data().markerRef;
                            const markerSnapshot = await getDoc(markerRef);
                            const markerData = markerSnapshot.data() as DocumentData
                            const coordinates = markerData.coordinates;
                            if (markerSnapshot.exists()) {
                                return {
                                    ...markerData,
                                    markerId: markerSnapshot.id,
                                    viewedAt: doc.data().viewedAt.toDate(),
                                    coordinates: {
                                        lat: coordinates.latitude,
                                        long: coordinates.longitude,
                                    }
                                } as IMarkerHistory;
                            } else {
                                console.warn(`Le marqueur avec l'ID ${markerRef.id} n'existe pas.`);
                                return null;
                            }
                        });

                        const historyWithNulls = await Promise.all(markerPromises);
                        const history: IMarkerHistory[] = historyWithNulls.filter(
                            (item): item is IMarkerHistory => item !== null
                        );

                        setHistory(history);
                        setLoading(MenuType.HISTORY, false)
                        return history
                    } catch (error) {
                        console.error("Erreur lors de la récupération de l'historique des marqueurs:", error);
                    }
                    break
                default:
                    console.error(`FirestoreAction: ${action} is not implemented`)
            }
            setLoading(MenuType.HISTORY, false)
        } else {
            console.warn("Utilisateur non connecté, impossible de gérer l'historique.");
        }
        return
    };


    return (
        <UserContext.Provider value={{ user, set, update, setFriends, logout, firestoreManageHistory }}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = (): UserContextProps => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

export { UserProvider, useUser };