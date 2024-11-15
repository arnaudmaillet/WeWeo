import { ICoodinatesWithZoom } from "./MapInterfaces";

export interface ICurrentUser extends IUser {
    location: ICoodinatesWithZoom
}
export interface IUser {
    userId: string,
    username: string,
    email: string,
    locale: string,
    birthdate: string,
    subscribedTo: string[],
    following: string[],
}