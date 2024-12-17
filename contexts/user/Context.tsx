import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { IUser, IFriend, UserActionType } from "~/contexts/user/types";
import { userReducer } from "./reducer";

interface UserContextProps {
    user: IUser | null;
    set: (user: IUser) => void;
    update: (user: IUser) => void;
    updateFriends: (friends: IFriend[]) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, dispatch] = useReducer(userReducer, null);

    const set = (user: IUser) => {
        dispatch({ type: UserActionType.SET, payload: user });
    };

    const update = (updated: IUser) => {
        dispatch({ type: UserActionType.UPDATE, payload: updated });
    };

    const updateFriends = (friends: IFriend[]) => {
        dispatch({ type: UserActionType.UPDATE_FRIENDS, payload: friends });
    };

    const logout = () => {
        dispatch({ type: UserActionType.LOGOUT });
    };

    return (
        <UserContext.Provider value={{ user, set, update, updateFriends, logout }}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = (): UserContextProps => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

export { UserProvider, useUser };