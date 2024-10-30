import { ICoordinates } from "./MapInterfaces";
import { IUser } from "./UserInterfaces";

export interface IMessage {
    messageId: string,
    senderInfo: IUser,
    markerId: string,
    content: string,
    timestamp: number
}

export interface IRoom {
    id: string,
    messages: IMessage[]
    participantsIds: string[]
}

export interface IMarkerChatScreen {
    marker: IMarker
}

export interface IMarkerChat extends IMarker {}
export interface IMarkerVideo extends IMarker {}
export interface IMarkerPhoto extends IMarker {}
export interface IMarkerLive extends IMarker {}


export interface IMarker {
    id: string;
    coordinates: ICoordinates;
    dataType: string;
    dataId?: string;
    minZoom: number;
    label: string;
}