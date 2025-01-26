import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { QueryKey, QUERY_OPTIONS } from "~/constants/constants";
import { updateLike, UpdateLikeParams } from "~/services/likes/update";
import { useUserStore } from "~/store/useUserStore";
import { IUser } from "~/types/userTypes";


interface ILike {
    user: IUser
    likedAt: number
}

const useLikes = (postId: string | undefined) => {
    const { user } = useUserStore();

    const queryResult = useQuery<ILike[] | undefined, Error>({
        queryKey: [QueryKey.LIKES],
        // queryFn: () => fetchLikes(postId),
        enabled: false,
        staleTime: QUERY_OPTIONS.staleTime,
        retry: QUERY_OPTIONS.retry,
    });

    const { isError, error } = queryResult;

    useEffect(() => {
        if (isError) {
            console.error(
                `[User: ${user?.userId}] Error fetching likes for post ${postId}: ${error}`
            );
        }
    }, [isError]);

    const update = useMutation({
        mutationFn: (state: boolean) => updateLike({ 
            postId: postId, 
            userId: user?.userId, 
            state: state 
        }),
        onError: (error: any) => console.error("Error updating likes:", error),
    });

    return {
        messages: queryResult,
        update: (state: boolean) => { update.mutate(state) }
    };
};

export { useLikes };
