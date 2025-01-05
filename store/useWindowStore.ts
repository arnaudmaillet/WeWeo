import { create } from "zustand";
import { WindowType } from "~/types/windowTypes";

interface WindowState {
  window: WindowType;
  isLoading: boolean
  set: (window: WindowType) => void;
  setLoading: (status: boolean) => void
}

const useWindowStore = create<WindowState>((set, get) => ({
    window: WindowType.NAVBAR,
    isLoading: false,
    set: (window) => set({ window }),
    setLoading: (status) => set({isLoading: status})
}));

export { useWindowStore }