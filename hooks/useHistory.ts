import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { QueryKey, QUERY_OPTIONS } from "~/constants/constants";
import { useNavbarStore } from "~/store/useNavbarStore";
import { TabType } from "~/types/navbarTypes";

import { fetchHistory } from "~/services/history/fetch";
import { createHistory } from "~/services/history/create";
import { IMarkerHistory } from "~/contexts/markers/types";
import { useUserStore } from "~/store/useUserStore";

interface createParams {
    postId: string;
    userId?: string;
}

const useHistory = () => {
    const { user } = useUserStore()
    const { setLoading } = useNavbarStore();

    const queryResult = useQuery<IMarkerHistory[] | null, Error>({
        queryKey: [QueryKey.HISTORY],
        queryFn: () => fetchHistory(user?.userId),
        enabled: !!user,
        staleTime: QUERY_OPTIONS.staleTime,
        retry: QUERY_OPTIONS.retry,
    });

    const { isLoading, isError, error } = queryResult;

    useEffect(() => {
        setLoading(TabType.HISTORY, isLoading ? true : false);
    }, [isLoading]);

    useEffect(()=>{
        isError && console.error(`[${user?.userId} ${user?.username}] Error fetching history data : ${error.message}`)
    }, [isError])

    const mutation = useMutation({
        mutationFn: ({ postId, userId }: createParams) => createHistory(postId, userId),
        onMutate: () => setLoading(TabType.HISTORY, true),
        onError: (error: any) => console.error("Error adding post to history:", error),
        onSettled: () => setLoading(TabType.HISTORY, false),
    });

    return { 
        history: queryResult, 
        createHistory: (postId: string, overrideUserId?: string) => { mutation.mutate({ postId, userId: overrideUserId ?? user?.userId }) }
    };
};

export { useHistory };
