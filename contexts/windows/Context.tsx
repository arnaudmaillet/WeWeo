import React, { createContext, useContext, useReducer } from "react";
import { reducer, initialState } from "./reducer";
import { WindowActionType, WindowState, WindowType } from "./types";

interface ContextProps {
    state: WindowState;
    setActive: (window: WindowType) => void;
    setLoaded: (isLoaded: boolean) => void;
}

const WindowContext = createContext<ContextProps | undefined>(undefined);

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // don'4t forget to setWindowLoaded to true on the exiting callback animations (reanimated)
    const setActive = (window: WindowType) => {
        setLoaded(false)
        dispatch({ type: WindowActionType.SET_ACTIVE, payload: window })
    }

    const setLoaded = (isLoaded: boolean) => {
        dispatch({ type: WindowActionType.SET_LOADED, payload: isLoaded })
    }

    return (
        <WindowContext.Provider value={{ state, setActive, setLoaded }}>
            {children}
        </WindowContext.Provider>
    );
};

export const useWindow = () => {
    const context = useContext(WindowContext);
    if (!context) {
        throw new Error("useWindow must be used within a WindowProvider");
    }
    return context;
};
