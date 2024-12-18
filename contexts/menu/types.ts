import { ReactElement } from "react"

enum MenuType {
    DISCOVER = "DISCOVER",
    FRIENDS = "FRIENDS",
    SUBS = "SUBS",
    HISTORY = "HISTORY",
    NEW = "NEW"
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
}

enum MenuActionType {
    SET_BUTTONS = "SET_BUTTONS",
    SET_LOADING = "TOGGLE_BUTTON_LOADING",
}


export { IMenu, MenuType, IButton, MenuActionType}