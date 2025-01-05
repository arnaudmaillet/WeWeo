import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/useUserStore';
import { signInUser, UserWithToken } from '~/services/auth/signIn';
import { QueryKey, StorageKeys } from '~/constants/constants';
import { signOutUser } from '~/services/auth/signOut';
import { useSecureStorage } from './useSecureStorage';

const useAuth = () => {
    const queryClient = useQueryClient();
    const { setTokens, removeTokens } = useSecureStorage()
    const { 
        set: setUser, 
        setLoading: setUserLoading,
        clearUser
    } = useUserStore()

    const signIn = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            setUserLoading(true);
            return await signInUser(email, password)
        },
        onSuccess: ({ user, token }: UserWithToken) => {
            setUser(user)
            setTokens(
                { key: StorageKeys.AuthToken, payload: token },
                { key: StorageKeys.UserEmail, payload: user.email }
            )
            queryClient.invalidateQueries({ queryKey: [QueryKey.USER] });
        },
        onError: (error) => console.error('Sign in failed:', error),
        onSettled: () => setUserLoading(false),
    });

    const signOut = useMutation({
        mutationFn: () => signOutUser(),
        onSuccess: () => {
            clearUser()
            removeTokens(StorageKeys.AuthToken, StorageKeys.UserEmail)
        },
        onError: (error) => console.error('Sign out failed:', error)
    });

    return { signIn, signOut }
};

export { useAuth }