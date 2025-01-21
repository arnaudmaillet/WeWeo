import { useEffect } from 'react';
import { listeningOnAuthChanges } from '~/services/auth/listener';
import { useUserStore } from '~/store/useUserStore';
import { StorageKeys } from '~/constants/constants';
import { IUser } from '~/types/userTypes';
import { useSecureStorage } from './useSecureStorage';


// Extracted from useAuth to avoid multiples listeners executions when useAuth() hook is called
const useAuthListener = () => {
    const { set: setUser, clearUser } = useUserStore();
    const { setTokens, removeTokens } = useSecureStorage()

    useEffect(() => {
        const unsubscribe = listeningOnAuthChanges((user: IUser | null) => {
            if (user) {
                setTokens(
                    { key: StorageKeys.AuthToken, payload: user.userId || '' },
                    { key: StorageKeys.UserEmail, payload: user.email || '' },
                )
                setUser(user);
            } else {
                removeTokens(StorageKeys.AuthToken, StorageKeys.UserEmail)
                clearUser();
            }
        });

        return () => unsubscribe();
    }, [setUser, clearUser]);
};

export { useAuthListener };
