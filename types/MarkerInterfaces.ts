import { ICoordinates } from "./MapInterfaces";

export interface IMessage {
    id: string,
    senderId: string,
    markerId: string,
    content: string,
    timestamp: number
}

export interface IRoom {
    id: string,
    messages: IMessage[]
    participantsIds: string[]
}

export interface IChatMarkerScreen {
    marker: IMarker,
    currentUserId: string
}

export interface IChatMarker extends IMarker {}
export interface IVideoMarker extends IMarker {}
export interface IPhotoMarker extends IMarker {}
export interface ILiveMarker extends IMarker {}


export interface IMarker {
    id: string;
    coordinates: ICoordinates;
    dataType: string;
    dataId?: string;
    minZoom: number;
    label: string;
}