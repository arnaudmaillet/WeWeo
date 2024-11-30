import React, { createContext, useContext, useReducer } from "react";
import { reducer, initialState } from "./reducer";
import { WindowActionType, WindowState, WindowType } from "./types";

interface ContextProps {
    state: WindowState;
    setActiveWindow: (window: WindowType) => void;
    setWindowLoaded: (isLoaded: boolean) => void;
}

const WindowContext = createContext<ContextProps | undefined>(undefined);

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const setActiveWindow = (window: WindowType) => {
        dispatch({ type: WindowActionType.SET_ACTIVE_WINDOW, payload: window })
    }

    const setWindowLoaded = (isLoaded: boolean) => {
        dispatch({ type: WindowActionType.SET_WINDOW_LOADED, payload: isLoaded })
    }

    return (
        <WindowContext.Provider value={{ state, setActiveWindow, setWindowLoaded }}>
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
