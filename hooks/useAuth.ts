import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { signInUser } from '~/services/auth/signIn';
import { QUERY_OPTIONS, QueryKey } from '~/constants/constants';
import { signOutUser } from '~/services/auth/signOut';
import { IUser } from '~/types/userTypes';
import { fetchUser } from '~/services/auth/fetch';
import { useEffect } from 'react';

type SignParams = {
    email: string; 
    password: string
}

const useAuth = () => {
    const queryClient = useQueryClient();

    const queryResult = useQuery<IUser | null, Error>({
            queryKey: [QueryKey.USER],
            queryFn: fetchUser,
            enabled: true,
            staleTime: Infinity,
            retry: QUERY_OPTIONS.retry,
        });

    const { isError, error } = queryResult;

    useEffect(()=>{
        isError && console.error(`[Error fetching user : ${error.message}`)
    }, [isError])

    const signIn = useMutation({
        mutationFn: async ({ email, password }: SignParams) => await signInUser(email, password),
        onSuccess: (user: IUser) => queryClient.setQueryData([QueryKey.USER], user),
        onError: (error) => console.error('Sign in failed:', error),
    });

    const signOut = useMutation({
        mutationFn: () => signOutUser(),
        onSuccess: () => queryClient.removeQueries({ queryKey: [QueryKey.USER] }),
        onError: (error) => console.error('Sign out failed:', error)
    });

    return { 
        user: queryResult,
        signIn, 
        signOut 
    }
};

export { useAuth }