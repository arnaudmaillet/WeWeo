import { createContext, ReactNode, useContext, useMemo, useReducer, useRef } from "react";
import { Animated } from "react-native";
import { WindowType } from "~/contexts/window/types";
import { IAnimatedButton } from "~/types/SwitchInterface";
import { Fontisto } from "@expo/vector-icons";
import { THEME } from "~/constants/constants";
import { useMap } from "~/contexts/MapProvider";
import { useWindow } from "~/contexts/window/Context"
import { useAuth } from "../AuthProvider";
import { initialMarkerState, markerReducer } from "./reducer";
import MapView from "react-native-maps";
import { IMarker, INewMarker, MarkerActionType, MarkerState } from "./types";

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
}

export const MarkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { user } = useAuth();
    const { setActive: setActiveWindow } = useWindow()

    const [state, dispatch] = useReducer(markerReducer, initialMarkerState);

    const mapRef = useRef<MapView | null>(null);

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
        state.newMarker && startAnimation(100, 1)
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