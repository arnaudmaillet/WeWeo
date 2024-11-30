export enum WindowType {
    DEFAULT = 'DEFAULT',
    NEW_MARKER = 'NEW_MARKER',
    CHAT = 'CHAT',
}

export interface WindowState {
    active: WindowType;
    isLoaded: boolean;
}

export enum WindowActionType {
    SET_ACTIVE = "SET_ACTIVE",
    SET_LOADED = "SET_LOADED"
}

export type WindowAction =
    | { type: WindowActionType.SET_ACTIVE; payload: WindowType }
    | { type: WindowActionType.SET_LOADED; payload: boolean }