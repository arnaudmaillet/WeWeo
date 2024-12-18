import { MenuType } from "~/contexts/menu/types";

enum WindowType {
    DEFAULT = 'DEFAULT',
    NEW_MARKER = 'NEW_MARKER',
    CHAT = 'CHAT',
}
interface IWindow {
    active: WindowType;
    isLoaded: boolean;
    menu: MenuType
}

enum WindowActionType {
    SET_ACTIVE = "SET_ACTIVE",
    SET_LOADED = "SET_LOADED",
    SET_MENU = "SET_MENU"
}

type WindowAction =
    | { type: WindowActionType.SET_ACTIVE; payload: WindowType }
    | { type: WindowActionType.SET_LOADED; payload: boolean }
    | { type: WindowActionType.SET_MENU; payload: MenuType }


export { WindowType, IWindow, WindowActionType, WindowAction }