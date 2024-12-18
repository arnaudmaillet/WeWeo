import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { IMenu, MenuType, MenuActionType, IButton } from "~/contexts/menu/types";
import { menuReducer } from "~/contexts/menu/reducer";
import { THEME } from "~/constants/constants";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

interface MenuContextProps {
    menu: IMenu;
    setButtons: (buttons: IButton[]) => void;
    setLoading: (buttonType: MenuType, isLoading: boolean) => void;
}

const MenuContext = createContext<MenuContextProps | undefined>(undefined);

const initialMenu: IMenu = {
    buttons: [
        {
            label: "Discover",
            type: MenuType.DISCOVER,
            isLoading: true,
            color: "gray",
            activeColor: THEME.colors.primary,
            icon: React.createElement(Ionicons, { name: "compass-outline", size: 20 }),
        },
        {
            label: "Subs",
            type: MenuType.SUBS,
            isLoading: false,
            color: "gray",
            activeColor: THEME.colors.primary,
            icon: React.createElement(MaterialIcons, { name: "bookmark-outline", size: 20 }),
        },
        {
            label: "Friends",
            type: MenuType.FRIENDS,
            isLoading: false,
            color: "gray",
            activeColor: THEME.colors.primary,
            icon: React.createElement(MaterialIcons, { name: "group", size: 20 }),
        },
        {
            label: "History",
            type: MenuType.HISTORY,
            isLoading: false,
            color: "gray",
            activeColor: THEME.colors.primary,
            icon: React.createElement(MaterialIcons, { name: "history", size: 20 }),
        },
        {
            label: "New",
            type: MenuType.NEW,
            isLoading: false,
            color: "gray",
            activeColor: THEME.colors.primary,
            icon: React.createElement(MaterialIcons, { name: "add-location-alt", size: 20 }),
        }
    ],
};

const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [menu, dispatch] = useReducer(menuReducer, initialMenu);

    const setButtons = (buttons: IButton[]) => {
        dispatch({ type: MenuActionType.SET_BUTTONS, payload: { buttons } });
    };

    const setLoading = (buttonType: MenuType, isLoading: boolean) => {
        dispatch({
            type: MenuActionType.SET_LOADING,
            payload: { buttonType, isLoading },
        });
    };

    return (
        <MenuContext.Provider value={{ menu, setButtons, setLoading }}>
            {children}
        </MenuContext.Provider>
    );
};

const useMenu = (): MenuContextProps => {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error("useMenu must be used within a MenuProvider");
    }
    return context;
};

export { MenuProvider, useMenu };
