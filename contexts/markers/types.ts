import { ICoordinates } from "~/types/MapInterfaces";
import { IUser } from "~/types/UserInterfaces";

export enum MarkerType {
    DEFAULT = 'DEFAULT',
    CHAT = 'CHAT',
}

export interface INewMessage {
    senderId: string,
    content: string,
    type: string,
    createdAt: number,
}

export interface IMessage extends INewMessage {
    messageId: string,
    senderInfo: IUser,
    markerId: string,
}

export interface IPolicy {
    isPrivate: boolean,
    show: string[]
}

export interface INewMarker {
    coordinates: ICoordinates;
    type: MarkerType;
    icon: string;
    label: string;
    policy: IPolicy;
}
export interface IMarker extends INewMarker {
    markerId: string;
    createdAt: number;
    creatorId: string;
    minZoom: number;
    subscribedUserIds: string[];
    connections: IUser[] | null;
    views: number;
    messages: IMessage[];
    isLoading: boolean
}
export interface MarkerState {
    list: IMarker[];
    new: INewMarker | IMarker | null;
    active: IMarker | null
}

export enum MarkerActionType {
    SET = "SET",
    REMOVE = "REMOVE",
    UPDATE = "UPDATE",
    SET_NEW = "SET_NEW",
    UPDATE_NEW = "UPDATE_NEW",
    SET_ACTIVE = "SET_ACTIVE",
    UPDATE_ACTIVE_LOADING = "UPDATE_ACTIVE_LOADING",
    UPDATE_ACTIVE_MESSAGES = "UPDATE_ACTIVE_MESSAGES",
    UPDATE_ACTIVE_CONNECTIONS = "UPDATE_ACTIVE_CONNECTIONS",
    UPDATE_ACTIVE_VIEWS = "UPDATE_ACTIVE_VIEWS"
}

export type MarkerAction =
    | { type: MarkerActionType.SET; payload: IMarker[] }
    | { type: MarkerActionType.REMOVE; payload: string }
    | { type: MarkerActionType.UPDATE; payload: IMarker }
    | { type: MarkerActionType.SET_NEW; payload: INewMarker | IMarker | null }
    | { type: MarkerActionType.UPDATE_NEW; payload: Partial<INewMarker | IMarker> }
    | { type: MarkerActionType.SET_ACTIVE; payload: IMarker | null }
    | { type: MarkerActionType.UPDATE_ACTIVE_LOADING; payload: boolean }
    | { type: MarkerActionType.UPDATE_ACTIVE_MESSAGES; payload: IMessage[] }
    | { type: MarkerActionType.UPDATE_ACTIVE_CONNECTIONS; payload: IUser[] }
    | { type: MarkerActionType.UPDATE_ACTIVE_VIEWS; payload: number }

