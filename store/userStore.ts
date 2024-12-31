import { create } from "zustand";
import { IMarker, IMarkerHistory } from "~/contexts/markers/types";
import { IFriend, IUser } from "~/types/userTypes";

interface UserState {
  user?: IUser;
  set: (user: IUser) => void;
  update: (user: IUser) => void;
  setMarkers: (markers: IMarker[]) => void;
  setFriends: (friends: IFriend[]) => void;
  setFriendsMarkers: (markers: IMarker[]) => void;
  setHistory: (history: IMarkerHistory[]) => void;
  logout:() => void
}

const useUserStore = create<UserState>((set, get) => ({
  user: undefined,

  set: (user) => set({ user }),

  update: (updatedUser) => {
    const currentUser = get().user;
    currentUser && set({ user: { ...currentUser, ...updatedUser } });
  },

  setMarkers: (markers) => {
    const currentUser = get().user;
    currentUser && set({ user: { ...currentUser, markers } });
  },

  setFriends: (friends) => {
    const currentUser = get().user;
    currentUser && set({ user: { ...currentUser, friends } });
  },

  setFriendsMarkers: (friendsMarkers) => {
    const currentUser = get().user;
    currentUser && set({ user: { ...currentUser, friendsMarkers } });
  },

  setHistory: (history) => {
    const currentUser = get().user;
    currentUser && set({ user: { ...currentUser, history } });
  },
  logout: () => set({ user: undefined }),
}));

export { useUserStore }
