import { IMarker } from "./MarkerInterfaces";

export interface ICoodinatesWithZoom extends ICoordinates {
    latDelta: number;
    longDelta: number;
}

export interface ICoordinates {
    __typename?: "Coordinates";
    lat: number;
    long: number;
}

export interface IMap {
    userLocation: ICoodinatesWithZoom;
    markers: IMarker[];
}