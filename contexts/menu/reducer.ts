import { IMenu, MenuType, IButton, MenuActionType } from "~/contexts/menu/types";

interface MenuAction {
  type: MenuActionType;
  payload?: {
    buttons?: IButton[];
    buttonType?: MenuType;
    isLoading?: boolean;
  };
}

const menuReducer = (menu: IMenu, action: MenuAction): IMenu => {
  switch (action.type) {
    case MenuActionType.SET_BUTTONS:
      return {
        ...menu,
        buttons: action.payload?.buttons || [],
      };

    case MenuActionType.SET_LOADING:
      return {
        ...menu,
        buttons: menu.buttons.map((button) =>
          button.type === action.payload?.buttonType
            ? { ...button, isLoading: action.payload?.isLoading ?? button.isLoading }
            : button
        ),
      };

    default:
      return menu;
  }
};

export { menuReducer };
