import { create } from "zustand";
import { IUser } from "~/types/userTypes";

interface UserState {
  user?: IUser;
  token?: string;
  isLoading: boolean;
  set: (user: IUser) => void;
  setLoading: (status: boolean) => void
  clearUser: () => void;
  logout:() => void
}

const useUserStore = create<UserState>((set, get) => ({
  user: undefined,
  token: undefined,
  isLoading: false,

  set: (user) => set({ user }),

  setLoading: (status) => {
    set({ isLoading: status})
  },

  logout: () => set({ user: undefined }),

  clearUser: () => {
    set({ user: undefined })
    set({ token: undefined })
  }
}));

export { useUserStore }
