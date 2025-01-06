import { create } from "zustand";
import { IMarker } from "~/contexts/markers/types";
import { IUser } from "~/types/userTypes";

interface UserState {
  user: null | IUser;
  token: null | string;
  isLoading: boolean;
  activePost: null | IMarker
  set: (user: IUser) => void;
  setLoading: (status: boolean) => void
  setActivePost: (post: null | IMarker) => void
  clearUser: () => void;
  logout:() => void
}

const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  activePost: null,

  set: (user) => set({ user }),

  setLoading: (status) => {
    set({ isLoading: status})
  },

  setActivePost: (post) => {
    set({ activePost: post })
  },

  logout: () => set({ user: null }),

  clearUser: () => {
    set({ user: null })
    set({ token: null })
  }
}));

export { useUserStore }
