import { WindowState, WindowAction, WindowType, WindowActionType } from "./types";

export const initialState: WindowState = {
    activeWindow: WindowType.DEFAULT,
    isWindowLoaded: false,
};

export const reducer = (state: WindowState, action: WindowAction): WindowState => {
    switch (action.type) {
        case WindowActionType.SET_ACTIVE_WINDOW:
            return { ...state, activeWindow: action.payload };
        case WindowActionType.SET_WINDOW_LOADED:
            return { ...state, isWindowLoaded: action.payload };
        default:
            throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
    }
};
