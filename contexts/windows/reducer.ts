import { IWindow, WindowAction, WindowType, WindowActionType } from "./types";
import { MenuType } from "~/contexts/menu/types";

const initialWindow: IWindow = {
    active: WindowType.DEFAULT,
    isLoaded: false,
    menu: MenuType.DISCOVER
};

const windowReducer = (window: IWindow, action: WindowAction): IWindow => {
    switch (action.type) {
        case WindowActionType.SET_ACTIVE:
            return { ...window, active: action.payload };
        case WindowActionType.SET_LOADED:
            return { ...window, isLoaded: action.payload };
        case WindowActionType.SET_MENU:
            return { ...window, menu: action.payload };
        default:
            throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
    }
};

export { initialWindow, windowReducer}