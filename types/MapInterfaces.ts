import { IMarker } from "./MarkerInterfaces";

export interface ICoodinatesWithZoom extends ICoordinates {
    latDelta: number;
    longDelta: number;
}

export interface ICoordinates {
    lat: number;
    long: number;
}

export interface IMap {}