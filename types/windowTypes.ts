enum WindowType {
    NAVBAR = 'NAVBAR',
    NEW_MARKER = 'NEW_MARKER',
    CHAT = 'CHAT',
}
interface IWindow {
    active: WindowType;
    isLoaded: boolean;
}

export { WindowType, IWindow }