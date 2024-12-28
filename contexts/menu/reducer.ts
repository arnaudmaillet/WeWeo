import { IMenu, MenuType, IButton, MenuActionType } from "~/contexts/menu/types";

type MenuAction =
    | { type: MenuActionType.SET_ACTIVE; payload: MenuType }
    | { type: MenuActionType.SET_BUTTONS; payload: IButton[] }
    | { type: MenuActionType.SET_OPEN; payload: boolean }
    | { type: MenuActionType.SET_LOADING; payload: { buttonType: MenuType; isLoading: boolean } };

const menuReducer = (menu: IMenu, action: MenuAction): IMenu => {
    switch (action.type) {
        case MenuActionType.SET_ACTIVE:
        return {
            ...menu,
            active: action.payload,
        };
    
        case MenuActionType.SET_BUTTONS:
        return {
            ...menu,
            buttons: action.payload,
        };

        case MenuActionType.SET_OPEN:
            return {
                ...menu,
                isOpen: action.payload,
            };
    
        case MenuActionType.SET_LOADING:
        return {
            ...menu,
            buttons: menu.buttons.map((button) =>
            button.type === action.payload.buttonType
                ? { ...button, isLoading: action.payload.isLoading }
                : button
            ),
        };
        
        default:
        return menu;
    }
    };
      

export { menuReducer };
