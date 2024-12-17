import { WindowState, WindowAction, WindowType, WindowActionType, MenuType } from "./types";

export const initialState: WindowState = {
    active: WindowType.DEFAULT,
    isLoaded: false,
    menu: MenuType.DISCOVER
};

export const reducer = (state: WindowState, action: WindowAction): WindowState => {
    switch (action.type) {
        case WindowActionType.SET_ACTIVE:
            return { ...state, active: action.payload };
        case WindowActionType.SET_LOADED:
            return { ...state, isLoaded: action.payload };
        case WindowActionType.SET_MENU:
            return { ...state, menu: action.payload };
        default:
            throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
    }
};
