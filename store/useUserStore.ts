import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { create } from "zustand";
import { IMarker } from "~/contexts/markers/types";
import { IUser } from "~/types/userTypes";

interface UserState {
  user: null | IUser;
  token: null | string;
  isLoading: boolean;
  isIncognito: boolean
  activePost: null | IMarker
  postFeed: null | IMarker[]
  set: (user: IUser) => void;
  setLoading: (status: boolean) => void
  setIsIncognito: (status: boolean) => void
  setActivePost: (post: null | IMarker) => void
  setPostsFeed: (posts: null | IMarker[]) => void
  clearUser: () => void;
  logout:() => void
}

const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isIncognito: false,
  activePost: null,
  postFeed: null,

  set: (user) => set({ user }),

  setLoading: (status) => { set({ isLoading: status}) },

  setIsIncognito: (status) => { 
    impactAsync(ImpactFeedbackStyle.Medium)
    set({ isIncognito: status }) 
  },

  setActivePost: (post) => { set({ activePost: post }) },

  setPostsFeed: (posts) => { set({ postFeed: posts }) },

  logout: () => set({ user: null }),

  clearUser: () => {
    set({ user: null })
    set({ token: null })
  }
}));

export { useUserStore }
