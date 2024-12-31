import { IWindow, WindowAction, WindowType, WindowActionType } from "./types";

const initialWindow: IWindow = {
    active: WindowType.DEFAULT,
    isLoaded: false,
};

const windowReducer = (window: IWindow, action: WindowAction): IWindow => {
    switch (action.type) {
        case WindowActionType.SET_ACTIVE:
            return { ...window, active: action.payload };
        case WindowActionType.SET_LOADED:
            return { ...window, isLoaded: action.payload };
        default:
            throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
    }
};

export { initialWindow, windowReducer}