import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryOptions } from "~/constants/constants";
import { useNavbarStore } from "~/store/navbarStore";
import { TabType } from "~/types/navbarTypes";
import { IUser } from "~/types/userTypes";

import { fetchHistory } from "~/services/history/fetch";
import { createHistory } from "~/services/history/create";
import { IMarkerHistory } from "~/contexts/markers/types";

interface AddToHistoryParams {
    postId: string;
    user?: IUser;
}

const useHistory = (user?: IUser) => {
    const { setLoading } = useNavbarStore();

    const queryResult = useQuery<IMarkerHistory[] | null, Error>({
        queryKey: ["history"],
        queryFn: () => fetchHistory(user?.userId),
        enabled: !!user,
        staleTime: queryOptions.staleTime,
        retry: queryOptions.retry,
    });

    const { isLoading, isError } = queryResult;

    useEffect(() => {
        setLoading(TabType.HISTORY, isLoading ? true : false);
    }, [isLoading]);

    useEffect(()=>{
        isError && console.error(`Error fetching history data, user ${user?.userId} ${user?.username}`)
    }, [isError])

    const mutation = useMutation({
        mutationFn: ({ postId, user }: AddToHistoryParams) => createHistory(postId, user?.userId),
        onMutate: () => setLoading(TabType.HISTORY, true),
        onError: (error: any) => console.error("Error adding post to history:", error),
        onSettled: () => setLoading(TabType.HISTORY, false),
    });

    return { 
        historyQuery: queryResult, 
        createHistory: (postId: string, overrideUser?: IUser) => { mutation.mutate({ postId, user: overrideUser ?? user }) }
    };
};

export { useHistory };
