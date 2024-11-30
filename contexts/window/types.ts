export enum WindowType {
    DEFAULT = 'DEFAULT',
    NEW_MARKER = 'NEW_MARKER',
    CHAT = 'CHAT',
}

export interface WindowState {
    activeWindow: WindowType;
    isWindowLoaded: boolean;
}

export enum WindowActionType {
    SET_ACTIVE_WINDOW = "SET_ACTIVE_WINDOW",
    SET_WINDOW_LOADED = "SET_WINDOW_LOADED"
}

export type WindowAction =
    | { type: WindowActionType.SET_ACTIVE_WINDOW; payload: WindowType }
    | { type: WindowActionType.SET_WINDOW_LOADED; payload: boolean };