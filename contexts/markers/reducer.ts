import { MarkerState, MarkerAction, MarkerActionType } from "./types";

export const initialMarkerState: MarkerState = {
    list: [],
    new: null,
    active: null
};

export const markerReducer = (state: MarkerState, action: MarkerAction): MarkerState => {
    switch (action.type) {
        case MarkerActionType.SET:
            return { ...state, list: action.payload };
        case MarkerActionType.REMOVE:
            return { ...state, list: state.list.filter(marker => marker.markerId !== action.payload) };
        case MarkerActionType.UPDATE:
            return {
                ...state,
                list: state.list.map(marker =>
                    marker.markerId === action.payload.markerId ? action.payload : marker
                ),
            };
        case MarkerActionType.SET_NEW:
            return { ...state, new: action.payload };
        case MarkerActionType.UPDATE_NEW:
            return {
                ...state,
                new: state.new
                    ? { ...state.new, ...action.payload }
                    : null,
            };
        case MarkerActionType.SET_ACTIVE:
            return { ...state, active: action.payload };
        case MarkerActionType.UPDATE_ACTIVE_MESSAGES:
            if (!state.active) {
                throw new Error("No active marker to update messages");
            }
            const updatedActiveMarker = {
                ...state.active,
                messages: action.payload,
            };
            return {
                ...state,
                active: updatedActiveMarker,
                list: state.list.map(marker =>
                    marker.markerId === updatedActiveMarker.markerId ? updatedActiveMarker : marker
                ),
            };
        default:
            throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
    }
};
