import { ICoordinates } from "./MapInterfaces";
import { IUser } from "./UserInterfaces";

export enum MarkerType {
    DEFAULT = 'init',
    CHAT = 'chat',
}

export enum MimeTypes {
    GIF = 'image/gif',
    JPEG = 'image/jpeg',
    PNG = 'image/png'
}

export interface IFile {
    name: string,
    url: string,
    type: MimeTypes
}

export interface IPolicy {
    isPrivate: boolean,
    show: string[]
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

export interface IRoom {
    id: string,
    messages: IMessage[]
    participantsIds: string[]
}


export interface INewMarker {
    coordinates: ICoordinates;
    dataType: MarkerType;
}

export interface IMarkerChat extends IMarker {}
export interface IMarkerVideo extends IMarker {}
export interface IMarkerPhoto extends IMarker {}
export interface IMarkerLive extends IMarker {}
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

export interface IMarkerChatScreen {
    marker: IMarker
}
