import { MenuType } from "~/contexts/menu/types";

enum WindowType {
    DEFAULT = 'DEFAULT',
    NEW_MARKER = 'NEW_MARKER',
    CHAT = 'CHAT',
}
interface IWindow {
    active: WindowType;
    isLoaded: boolean;
}

enum WindowActionType {
    SET_ACTIVE = "SET_ACTIVE",
    SET_LOADED = "SET_LOADED",
}

type WindowAction =
    | { type: WindowActionType.SET_ACTIVE; payload: WindowType }
    | { type: WindowActionType.SET_LOADED; payload: boolean }


export { WindowType, IWindow, WindowActionType, WindowAction }