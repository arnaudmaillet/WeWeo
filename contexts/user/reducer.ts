import { IUser, UserAction, UserActionType } from "~/contexts/user/types";

const initialUser: IUser | null = null

const userReducer = (state: IUser | null, action: UserAction): IUser | null => {
    switch (action.type) {
        case UserActionType.SET:
            return { ...action.payload };

        case UserActionType.UPDATE:
            return state ? { ...state, ...action.payload } : null;

        case UserActionType.UPDATE_FRIENDS:
            return state ? { ...state, friends: action.payload } : null;

        case UserActionType.LOGOUT:
            return null;
            
        default:
            return state;
    }
};

export { initialUser, userReducer }