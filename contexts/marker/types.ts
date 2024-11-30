import { ICoordinates } from "~/types/MapInterfaces";

export enum MarkerType {
    DEFAULT = 'DEFAULT',
    CHAT = 'CHAT',
}

export interface IPolicy {
    isPrivate: boolean,
    show: string[]
}

export interface INewMarker {
    coordinates: ICoordinates;
    type: MarkerType;
}
export interface IMarker extends INewMarker {
    markerId: string;
    createdAt: number;
    senderId: string;
    label: string;
    minZoom: number;
    subscribedUserIds: string[];
    connectedUserIds: string[];
    policy: IPolicy;
}
export interface MarkerState {
    markers: IMarker[];
    newMarker: INewMarker | IMarker | null;
}

export enum MarkerActionType {
    SET = "SET",
    ADD = "ADD",
    REMOVE = "REMOVE",
    UPDATE = "UPDATE",
    SET_NEW = "SET_NEW",
    UPDATE_NEW = "UPDATE_NEW",
}

export type MarkerAction =
    | { type: MarkerActionType.SET; payload: IMarker[] }
    | { type: MarkerActionType.ADD; payload: IMarker }
    | { type: MarkerActionType.REMOVE; payload: string }
    | { type: MarkerActionType.UPDATE; payload: IMarker }
    | { type: MarkerActionType.SET_NEW; payload: INewMarker | IMarker | null }
    | { type: MarkerActionType.UPDATE_NEW; payload: Partial<INewMarker | IMarker> }

