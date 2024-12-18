import { IMarker, IMarkerHistory } from "~/contexts/markers/types";
import { ICoodinatesWithZoom } from "~/types/MapInterfaces";

interface IUser {
    userId: string,
    username: string,
    email: string,
    locale: string,
    birthdate: string,
    ownerOf: IMarker[],
    subscribedTo?: IMarker[],
    location?: ICoodinatesWithZoom
    friends?: IFriend[],
    history?: IMarkerHistory[]
}

interface IFriend extends IUser {
    addedAt: number
}

enum UserActionType {
    SET = "SET",
    UPDATE = "UPDATE",
    SET_FRIENDS = "SET_FRIENDS",
    SET_HISTORY = "SET_HISTORY",
    LOGOUT = "LOGOUT",
}

type UserAction =
    | { type: UserActionType.SET; payload: IUser }
    | { type: UserActionType.UPDATE; payload: IUser }
    | { type: UserActionType.SET_FRIENDS; payload: IFriend[] }
    | { type: UserActionType.SET_HISTORY; payload: IMarkerHistory[] }
    | { type: UserActionType.LOGOUT }


export{ IUser, IFriend, UserActionType, UserAction }