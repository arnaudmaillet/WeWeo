import { ReactElement } from "react"

enum TabType {
    DISCOVER = "DISCOVER",
    FRIENDS = "FRIENDS",
    SUBSCRIPTIONS = "SUBSCRIPTIONS",
    HISTORY = "HISTORY",
    SEARCH = "SEARCH",
}

interface ITab {
    label: string
    color: string
    activeColor: string
    type: TabType
    isLoading: boolean
    icon: ReactElement
}

export { ITab, TabType }