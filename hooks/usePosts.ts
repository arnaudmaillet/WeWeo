import { useMutation, useQuery } from "@tanstack/react-query";
import { IMarker } from "~/contexts/markers/types";

import { useEffect } from "react";
import { TabType } from "~/types/navbarTypes";
import { useNavbarStore } from "~/store/useNavbarStore";
import { QueryKey, QUERY_OPTIONS } from "~/constants/constants";

import { fetchPosts } from "~/services/posts/fetch";
import { useUserStore } from "~/store/useUserStore";
import { createPost, IPostPayloadOnCreate } from "~/services/posts/create";

interface createParams {
    payload: IPostPayloadOnCreate;
    userId?: string;
}

const usePosts = () => {
    const { user } = useUserStore()
    const { setLoading } = useNavbarStore();
    
    const queryResult = useQuery<IMarker[] | undefined, Error>({
            queryKey: [QueryKey.POSTS],
            queryFn:() => fetchPosts(),
            enabled: !!user,
            staleTime: QUERY_OPTIONS.staleTime,
            retry: QUERY_OPTIONS.retry,
        }
    );

    const { isError, error, isFetching } = queryResult;

    useEffect(()=> {
        setLoading(TabType.DISCOVER, isFetching ? true : false);
    }, [isFetching])

    useEffect(()=>{
        isError && console.error(`[${user?.userId} ${user?.username}] Error fetching posts data : ${error.message}`)
    }, [isError])


    const mutation = useMutation({
        mutationFn: ({ payload, userId }: createParams) => createPost(payload, userId),
        onMutate: () => setLoading(TabType.DISCOVER, true),
        onError: (error: any) => console.error("Error adding post to history:", error),
        onSettled: () => setLoading(TabType.DISCOVER, false),
    });

    return {
        posts: queryResult,
        createPost: (payload: IPostPayloadOnCreate, overrideUserId?: string) => { mutation.mutate({ payload, userId: overrideUserId ?? user?.userId }) }
    }
};

export { usePosts }