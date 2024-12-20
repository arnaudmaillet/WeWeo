import { ICoordinates } from "~/types/MapInterfaces";
import { IUser } from "../user/types";

enum MarkerType {
    DEFAULT = 'DEFAULT',
    CHAT = 'CHAT',
}

interface INewMessage {
    senderId: string,
    content: string,
    type: string,
    createdAt: number,
}

interface IMessage extends INewMessage {
    messageId: string,
    senderInfo: IUser,
    markerId: string,
}

interface IPolicy {
    isPrivate: boolean,
    show: string[]
}

interface INewMarker {
    coordinates: ICoordinates;
    type: MarkerType;
    icon: string;
    label: string;
    policy: IPolicy;
}
interface IMarker extends INewMarker {
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

interface IMarkerHistory extends IMarker {
    viewedAt: number
}
interface MarkerState {
    list: IMarker[];
    filteredList?: IMarker[];
    new: INewMarker | IMarker | null;
    active: IMarker | null
}

enum MarkerActionType {
    SET = "SET",
    REMOVE = "REMOVE",
    UPDATE = "UPDATE",
    SET_FILTERED = "SET_FILTERED",
    ADD_FILTERED = "ADD_FILTERED",
    REMOVE_FILTERED = "REMOVE_FILTERED",
    SET_NEW = "SET_NEW",
    UPDATE_NEW = "UPDATE_NEW",
    SET_ACTIVE = "SET_ACTIVE",
    UPDATE_ACTIVE_LOADING = "UPDATE_ACTIVE_LOADING",
    UPDATE_ACTIVE_MESSAGES = "UPDATE_ACTIVE_MESSAGES",
    UPDATE_ACTIVE_CONNECTIONS = "UPDATE_ACTIVE_CONNECTIONS",
    UPDATE_ACTIVE_VIEWS = "UPDATE_ACTIVE_VIEWS"
}

export { MarkerType, INewMessage, IMessage, IPolicy, INewMarker, IMarker, MarkerState, MarkerActionType, IMarkerHistory }