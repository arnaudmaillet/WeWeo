import { IUser } from "../user/types";
import { MarkerState, MarkerActionType, IMarker, INewMarker, IMessage } from "./types";

export type MarkerAction =
    | { type: MarkerActionType.SET; payload: IMarker[] }
    | { type: MarkerActionType.REMOVE; payload: string }
    | { type: MarkerActionType.UPDATE; payload: IMarker }
    | { type: MarkerActionType.SET_FILTERED; payload: IMarker[] | undefined}
    | { type: MarkerActionType.SET_NEW; payload: INewMarker | IMarker | null }
    | { type: MarkerActionType.UPDATE_NEW; payload: Partial<INewMarker | IMarker> }
    | { type: MarkerActionType.SET_ACTIVE; payload: IMarker | null }
    | { type: MarkerActionType.UPDATE_ACTIVE_LOADING; payload: boolean }
    | { type: MarkerActionType.UPDATE_ACTIVE_MESSAGES; payload: IMessage[] }
    | { type: MarkerActionType.UPDATE_ACTIVE_CONNECTIONS; payload: IUser[] }
    | { type: MarkerActionType.UPDATE_ACTIVE_VIEWS; payload: number }

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
        case MarkerActionType.SET_FILTERED:
            return { ...state, filteredList: action.payload };
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
        case MarkerActionType.UPDATE_ACTIVE_CONNECTIONS:
            if (!state.active) {
                return state;
            }
            const updatedActiveConnections = {
                ...state.active,
                connections: action.payload,
            };
            return {
                ...state,
                active: updatedActiveConnections,
                list: state.list.map(marker =>
                    marker.markerId === updatedActiveConnections.markerId ? updatedActiveConnections : marker
                ),
            };
        case MarkerActionType.UPDATE_ACTIVE_VIEWS:
            if (!state.active) {
                throw new Error("No active marker to update viewers users");
            }
            const updatedActiveViews = {
                ...state.active,
                views: action.payload,
            };
            return {
                ...state,
                active: updatedActiveViews,
                list: state.list.map(marker =>
                    marker.markerId === updatedActiveViews.markerId ? updatedActiveViews : marker
                ),
            };
        case MarkerActionType.UPDATE_ACTIVE_LOADING: 
            if (!state.active) {
                throw new Error("No active marker to set loading users");
            }
            const updatedActiveLoading = {
                ...state.active,
                isLoading: action.payload,
            };
            return {
                ...state,
                active: updatedActiveLoading,
                list: state.list.map(marker =>
                    marker.markerId === updatedActiveLoading.markerId ? updatedActiveLoading : marker
                ),
            };
        default:
            throw new Error(`Unhandled action type: ${JSON.stringify(action)}`);
    }
};
