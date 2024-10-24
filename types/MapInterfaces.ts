export interface ICoordinates {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface IPoint {
    id: string;
    latitude: number;
    longitude: number;
    type: number;
    dataId?: string;
    minZoom: number;
}

export interface IMap {
    userLocation: ICoordinates;
    selectedPoint: IPoint | null;
    setSelectedPoint: (point: IPoint | null) => void;
    chats: {
        data: any[];
    }
}