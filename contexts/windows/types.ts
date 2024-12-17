export enum WindowType {
    DEFAULT = 'DEFAULT',
    NEW_MARKER = 'NEW_MARKER',
    CHAT = 'CHAT',
}

export enum MenuType {
    DISCOVER = "DISCOVER",
    FRIENDS = "FRIENDS",
    SUBS = "SUBS",
    HISTORY = "HISTORY",
    NEW = "NEW"
}

export interface WindowState {
    active: WindowType;
    isLoaded: boolean;
    menu: MenuType
}

export enum WindowActionType {
    SET_ACTIVE = "SET_ACTIVE",
    SET_LOADED = "SET_LOADED",
    SET_MENU = "SET_MENU"
}

export type WindowAction =
    | { type: WindowActionType.SET_ACTIVE; payload: WindowType }
    | { type: WindowActionType.SET_LOADED; payload: boolean }
    | { type: WindowActionType.SET_MENU; payload: MenuType }