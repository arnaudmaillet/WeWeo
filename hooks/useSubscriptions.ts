import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { QueryKey, QUERY_OPTIONS } from "~/constants/constants";
import { IMarker } from "~/contexts/markers/types";
import { createSubscription } from "~/services/subscriptions/create";
import { deleteSubscription } from "~/services/subscriptions/delete";
import { fetchSubscriptions } from "~/services/subscriptions/fetch";
import { useNavbarStore } from "~/store/useNavbarStore";
import { useUserStore } from "~/store/useUserStore";
import { TabType } from "~/types/navbarTypes";


const useSubscriptions = () => {

    const { user, activePost } = useUserStore()
    const { setLoading } = useNavbarStore()
    const [isSubscribed, setIsSubscribed] = useState<boolean>()

    const queryClient = useQueryClient()

    const queryResult = useQuery<IMarker[] | null, Error>({
        queryKey: [QueryKey.SUBSCRIPTIONS],
        queryFn: () => fetchSubscriptions(user?.userId),
        enabled: !!user,
        staleTime: QUERY_OPTIONS.staleTime,
        retry: QUERY_OPTIONS.retry,
    });

    const { data, isLoading, isError, error } = queryResult;

    useEffect(() => {
        setLoading(TabType.SUBSCRIPTIONS, isLoading ? true : false);
    }, [isLoading]);

    useEffect(()=>{
        isError && console.error(`[${user?.userId} ${user?.username}] Error fetching subscriptions posts : ${error.message}`)
    }, [isError])

    useEffect(()=> {
        setIsSubscribed(data?.some((post: IMarker) => post.markerId === activePost?.markerId) || false)
    }, [activePost])

    const subscribeMutation = useMutation({
        mutationFn: (postId: string) => createSubscription(postId, user?.userId),
        onSuccess: () => {
            setIsSubscribed(true);
            queryClient.invalidateQueries({ queryKey: [QueryKey.SUBSCRIPTIONS] });
        },
        onError: (error: any) => console.error("Error subscribing to post:", error),
    });

    const unsubscribeMutation = useMutation({
        mutationFn: (postId: string) => deleteSubscription(postId, user?.userId),
        onSuccess: () => {
            setIsSubscribed(false);
            queryClient.invalidateQueries({ queryKey: [QueryKey.SUBSCRIPTIONS] });
        },
        onError: (error: any) => console.error("Error unsubscribing from post:", error),
    });

    const toggleSubscription = (postId: string) => {
        if (isSubscribed) {
            unsubscribeMutation.mutate(postId);
        } else {
            subscribeMutation.mutate(postId);
        }
    };

    return {
        subscriptions: queryResult,
        isSubscribed,
        toggleSubscription,
    };
};


export { useSubscriptions };
