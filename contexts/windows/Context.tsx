import React, { createContext, useContext, useReducer } from "react";
import { windowReducer, initialWindow } from "./reducer";
import { WindowActionType, IWindow, WindowType } from "./types";
import { MenuType } from "~/contexts/menu/types";

interface ContextProps {
    window: IWindow;
    setActive: (payload: WindowType) => void;
    setLoaded: (payload: boolean) => void;
    setMenu: (payload: MenuType) => void;
}

const WindowContext = createContext<ContextProps | undefined>(undefined);

const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [window, dispatch] = useReducer(windowReducer, initialWindow);

    // don'4t forget to setWindowLoaded to true on the exiting callback animations (reanimated)
    const setActive = (payload: WindowType) => {
        setLoaded(false)
        dispatch({ type: WindowActionType.SET_ACTIVE, payload: payload })
    }

    const setLoaded = (payload: boolean) => {
        dispatch({ type: WindowActionType.SET_LOADED, payload: payload })
    }

    const setMenu = (payload: MenuType) => {
        dispatch({ type: WindowActionType.SET_MENU, payload: payload })
    }

    return (
        <WindowContext.Provider value={{ window, setActive, setLoaded, setMenu }}>
            {children}
        </WindowContext.Provider>
    );
};

const useWindow = () => {
    const context = useContext(WindowContext);
    if (!context) {
        throw new Error("useWindow must be used within a WindowProvider");
    }
    return context;
};

export { WindowProvider, useWindow }