import { IMarker } from "~/contexts/markers/types";
import { ICoodinatesWithZoom } from "~/types/MapInterfaces";

interface IUser {
    userId: string,
    username: string,
    email: string,
    locale: string,
    birthdate: string,
    subscribedTo: string[],
    ownerOf: IMarker[],
    location?: ICoodinatesWithZoom
    friends?: IFriend[],
}

interface IFriend extends IUser {
    addedAt: number
}

enum UserActionType {
    SET = "SET",
    UPDATE = "UPDATE",
    UPDATE_FRIENDS = "UPDATE_FRIENDS",
    LOGOUT = "LOGOUT",
}

type UserAction =
    | { type: UserActionType.SET; payload: IUser }
    | { type: UserActionType.UPDATE; payload: IUser }
    | { type: UserActionType.UPDATE_FRIENDS; payload: IFriend[] }
    | { type: UserActionType.LOGOUT }


export{ IUser, IFriend, UserActionType, UserAction }