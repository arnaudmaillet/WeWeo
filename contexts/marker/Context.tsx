import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { Animated } from "react-native";
import { WindowType } from "~/contexts/window/types";
import { IAnimatedButton } from "~/types/SwitchInterface";
import { Fontisto } from "@expo/vector-icons";
import { THEME } from "~/constants/constants";
import { useWindow } from "~/contexts/window/Context"
import { useAuth } from "../AuthProvider";
import { initialMarkerState, markerReducer } from "./reducer";
import { IMarker, INewMarker, MarkerActionType, MarkerState } from "./types";
import { addDoc, collection, GeoPoint, onSnapshot, query, where } from "firebase/firestore";
import { firestore } from "~/firebase";
import { ICoordinates } from "~/types/MapInterfaces";

const MarkerContext = createContext({});

export interface MarkerContextProps {
    state: MarkerState
    dotAnimation: Animated.Value
    closeAnimation: Animated.Value
    newMarkerButtons: IAnimatedButton[]
    enteringAnimation: () => Promise<void>
    exitingAnimation: (setActiveWindow: WindowType) => Promise<void>
    setNew: (marker: INewMarker | IMarker | null) => void
    updateNew: (updatedFields: Partial<INewMarker | IMarker>) => void
    setActive: (marker: IMarker | null) => void
}

export const MarkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { user } = useAuth();
    const { setActive: setActiveWindow } = useWindow()

    const [state, dispatch] = useReducer(markerReducer, initialMarkerState);

    const dotAnimation = useRef(new Animated.Value(0)).current;
    const closeAnimation = useRef(new Animated.Value(0)).current;


    const newMarkerButtons: IAnimatedButton[] = useMemo(() => [
        {
            text: { label: "chat", color: { default: THEME.colors.primary, active: THEME.colors.text.white } },
            icon: { label: "hipchat", size: 10, component: <Fontisto />, color: { default: THEME.colors.primary, active: THEME.colors.text.white } },
            background: { default: THEME.colors.grayscale.main, active: THEME.colors.primary },
            animation: new Animated.Value(0),
        }
    ], []);

    const fetchMarkers = () => {
        if (!user?.userId) return;

        const markersCollection = collection(firestore, "markers");
        const userMarkersQuery = query(markersCollection, where("policy.show", "array-contains", user.userId));
        const publicMarkersQuery = query(markersCollection, where("policy.isPrivate", "==", false));
        const unsubscribes: (() => void)[] = [];

        let allMarkers = new Map();

        const userMarkersUnsubscribe = onSnapshot(userMarkersQuery, (snapshot) => {
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

    const addMarker = async (marker: IMarker): Promise<boolean> => {
        if (!user || !marker) return false;
        try {
            const { coordinates, ...rest } = marker;

            await addDoc(collection(firestore, "markers"), {
                coordinates: new GeoPoint(coordinates.lat, coordinates.long),
                ...rest
            });

            dispatch({ type: MarkerActionType.SET_NEW, payload: null });
            return true;
        } catch (error) {
            console.error("Failed to add marker:", error);
            return false;
        }
    };

    const startAnimation = async (duration: number, toValue: number, callback?: () => void) => {
        Animated.stagger(duration, [
            Animated.spring(dotAnimation, { toValue: toValue, useNativeDriver: true }),
            ...newMarkerButtons.map(button =>
                Animated.spring(button.animation, { toValue: toValue, useNativeDriver: true })
            ),
            Animated.spring(closeAnimation, { toValue: toValue, useNativeDriver: true }),
        ]).start(() => callback && callback());
    }

    const resetAnimation = () => {
        dotAnimation.setValue(0);
        closeAnimation.setValue(0);
        newMarkerButtons.forEach(button => button.animation.setValue(0));
    };

    const enteringAnimation = async () => {
        resetAnimation();
        state.new && startAnimation(100, 1)
    };

    const exitingAnimation = async (window: WindowType) => {
        setActiveWindow(window)
        await startAnimation(100, 0, () => resetAnimation())
    };

    const setNew = (marker: INewMarker | IMarker | null) => {
        dispatch({ type: MarkerActionType.SET_NEW, payload: marker });
    };

    const updateNew = (updatedFields: Partial<INewMarker | IMarker>) => {
        dispatch({ type: MarkerActionType.UPDATE_NEW, payload: updatedFields });
    };

    const setActive = (marker: IMarker | null) => {
        dispatch({ type: MarkerActionType.SET_ACTIVE, payload: marker });
    }

    useEffect(() => {
        user && fetchMarkers();
    }, [user]);

    return (
        <MarkerContext.Provider value={{
            state,
            dotAnimation,
            closeAnimation,
            newMarkerButtons,
            enteringAnimation,
            exitingAnimation,
            setNew,
            updateNew,
            setActive
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