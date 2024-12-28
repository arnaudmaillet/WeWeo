import { ReactElement } from "react"

enum MenuType {
    DISCOVER = "DISCOVER",
    FRIENDS = "FRIENDS",
    SUBS = "SUBS",
    HISTORY = "HISTORY",
    SEARCH = "SEARCH",
}

interface IButton {
    label: string
    color: string
    activeColor: string
    type: MenuType
    isLoading: boolean
    icon: ReactElement
}

interface IMenu {
   buttons: IButton[]
   active: MenuType
   isOpen: boolean
}

enum MenuActionType {
    SET_ACTIVE = "SET_ACTIVE",
    SET_BUTTONS = "SET_BUTTONS",
    SET_LOADING = "TOGGLE_BUTTON_LOADING",
    SET_OPEN = "SET_OPEN"
}


export { IMenu, MenuType, IButton, MenuActionType}