export interface CoordinatesProps {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export interface PointProps {
    id: number;
    latitude: number;
    longitude: number;
    type: number;
    dataId?: number;
    minZoom: number;
}

export interface MapProps {
    userLocation: CoordinatesProps;
    selectedPoint: PointProps | null;
    setSelectedPoint: (point: PointProps | null) => void;
    chats: {
        data: any[];
    }
}