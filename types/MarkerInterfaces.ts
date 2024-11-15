import { ICoordinates } from "./MapInterfaces";
import { IUser } from "./UserInterfaces";

export enum ChatTypes {
    Chat = 'chat',
    Group = 'group',
    Channel = 'channel'
}

export enum MimeTypes {
    GIF = 'image/gif',
    JPEG = 'image/jpeg',
    PNG = 'image/png'
}

export interface IFile {
    name: string,
    uri: string,
    url: string,
    type: MimeTypes
}

export interface IMessage {
    messageId: string,
    senderId: string,
    senderInfo: IUser,
    markerId: string,
    content: string,
    createdAt: number,
    type: string
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
    coordinates: ICoordinates;
    createdAt?: number;
    senderId?: string;
    label: string;
    markerId: string;
    minZoom: number;
    subscribedUserIds: string[];
    connectedUserIds: string[];
    dataType?: string;
  }