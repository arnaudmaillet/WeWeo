import { MarkerState, MarkerAction, MarkerActionType } from "./types";

export const initialMarkerState: MarkerState = {
    markers: [],
    newMarker: null,
};

export const markerReducer = (state: MarkerState, action: MarkerAction): MarkerState => {
    switch (action.type) {
        case MarkerActionType.SET:
            return { ...state, markers: action.payload };
        case MarkerActionType.ADD:
            return { ...state, markers: [...state.markers, action.payload] };
        case MarkerActionType.REMOVE:
            return { ...state, markers: state.markers.filter(marker => marker.markerId !== action.payload) };
        case MarkerActionType.UPDATE:
            return {
                ...state,
                markers: state.markers.map(marker =>
                    marker.markerId === action.payload.markerId ? action.payload : marker
                ),
            };
        case MarkerActionType.SET_NEW:
            return { ...state, newMarker: action.payload };
        case MarkerActionType.UPDATE_NEW:
            return {
                ...state,
                newMarker: state.newMarker
                    ? { ...state.newMarker, ...action.payload }
                    : null,
            };
        default:
            throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
    }
};
