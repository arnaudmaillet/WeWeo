import { createContext, ReactNode, useContext, useMemo, useRef } from "react";
import { Animated } from "react-native";
import { useMap } from "./MapProvider";
import { WindowType } from "~/contexts/window/types";
import { IButton } from "~/types/SwitchInterface";
import { Fontisto } from "@expo/vector-icons";
import { THEME } from "~/constants/constants";
import { useWindow } from "./window/Context";

const NewMarkerContext = createContext({});

export interface IAnimatedButton extends IButton {
    animation: Animated.Value
}

export interface NewMarkerContextProps {
    animateMarkersEntering: () => Promise<void>
    animateMarkersExiting: (windowToDisplayWhenFinished: WindowType) => Promise<void>
    dotAnimation: Animated.Value
    closeAnimation: Animated.Value
    newMarkerButtons: IAnimatedButton[]
}

export const NewMarkerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { newMarker } = useMap();
    const { setActiveWindow } = useWindow()

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

    const resetAnimations = () => {
        dotAnimation.setValue(0);
        closeAnimation.setValue(0);
        newMarkerButtons.forEach(button => button.animation.setValue(0));
    };

    const animateMarkersEntering = () => {
        resetAnimations();
        if (newMarker) {
            Animated.stagger(100, [
                Animated.spring(dotAnimation, { toValue: 1, useNativeDriver: true }),
                ...newMarkerButtons.map(button =>
                    Animated.spring(button.animation, { toValue: 1, useNativeDriver: true })
                ),
                Animated.spring(closeAnimation, { toValue: 1, useNativeDriver: true }),
            ]).start();
        }
    };

    const animateMarkersExiting = async (windowToDisplayWhenFinished: WindowType) => {
        setActiveWindow(windowToDisplayWhenFinished)
        Animated.stagger(100, [
            Animated.spring(dotAnimation, { toValue: 0, useNativeDriver: true }),
            ...newMarkerButtons.map(button =>
                Animated.spring(button.animation, { toValue: 0, useNativeDriver: true })
            ),
            Animated.spring(closeAnimation, { toValue: 0, useNativeDriver: true }),
        ]).start(() => {
            resetAnimations();
        });
    };

    return (
        <NewMarkerContext.Provider value={{ animateMarkersEntering, animateMarkersExiting, dotAnimation, closeAnimation, newMarkerButtons }}>
            {children}
        </NewMarkerContext.Provider>
    );
}

export const useNewMarker = () => {
    const context = useContext(NewMarkerContext);
    if (context === undefined) {
        throw new Error('useNewMarker must be used within a MarkerProvider');
    }
    return context as NewMarkerContextProps;
}