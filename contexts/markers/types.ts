import { ICoordinates } from "~/types/MapInterfaces";
import { IUser } from "~/types/UserInterfaces";

export enum MarkerType {
    DEFAULT = 'DEFAULT',
    CHAT = 'CHAT',
}

export interface IMessage {
    messageId: string,
    senderId: string,
    senderInfo: IUser,
    markerId: string,
    content: string,
    createdAt: number,
    type: string,
    combinedKey?: string
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
    connectedUserIds: string[];
    messages: IMessage[]
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
    UPDATE_ACTIVE_MESSAGES = "UPDATE_ACTIVE_MESSAGES",
}

export type MarkerAction =
    | { type: MarkerActionType.SET; payload: IMarker[] }
    | { type: MarkerActionType.REMOVE; payload: string }
    | { type: MarkerActionType.UPDATE; payload: IMarker }
    | { type: MarkerActionType.SET_NEW; payload: INewMarker | IMarker | null }
    | { type: MarkerActionType.UPDATE_NEW; payload: Partial<INewMarker | IMarker> }
    | { type: MarkerActionType.SET_ACTIVE; payload: IMarker | null }
    | { type: MarkerActionType.UPDATE_ACTIVE_MESSAGES; payload: IMessage[] }

