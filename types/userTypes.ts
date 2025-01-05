import { IMarker } from "~/contexts/markers/types";
import { ICoodinatesWithZoom } from "~/types/MapInterfaces";

interface IUser {
    userId: string,
    username: string,
    email: string,
    locale: string,
    birthdate: string,
    ownerOf: IMarker[],
    markers?: IMarker[],
    subscribedTo?: IMarker[],
    location?: ICoodinatesWithZoom,
}

interface IFriend extends IUser {
    addedAt: number,
    [key: string]: any;
}

export{ IUser, IFriend }