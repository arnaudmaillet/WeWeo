import { IUser, UserAction, UserActionType } from "~/contexts/user/types";

const initialUser: IUser | null = null

const userReducer = (user: IUser | null, action: UserAction): IUser | null => {
    switch (action.type) {
        case UserActionType.SET:
            return { ...action.payload };

        case UserActionType.UPDATE:
            return user ? { ...user, ...action.payload } : null;

        case UserActionType.SET_FRIENDS:
            return user ? { ...user, friends: action.payload } : null;

        case UserActionType.SET_HISTORY:
            return user ? { ...user, history: action.payload } : null;

        case UserActionType.LOGOUT:
            return null;
            
        default:
            return user;
    }
};

export { initialUser, userReducer }