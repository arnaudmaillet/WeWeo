import { useUserStore } from "~/store/userStore";

export const logout = () => {
    useUserStore.getState().logout();
};
