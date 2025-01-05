import { useQuery } from "@tanstack/react-query";
import { IMarker } from "~/contexts/markers/types";

import { fetchFriends } from "~/services/friends/fetch";
import { useEffect, useState } from "react";
import { TabType } from "~/types/navbarTypes";
import { useNavbarStore } from "~/store/useNavbarStore";
import { QueryKey, queryOptions } from "~/constants/constants";
import { useUserStore } from "~/store/useUserStore";
import { IFriend } from "~/types/userTypes";

const useFriends = () => {
    const { user } = useUserStore()
    const { setLoading } = useNavbarStore();
    const [posts, setPosts] = useState<IMarker[]>([])
    
    const queryResult = useQuery<IFriend[] | undefined, Error>({
            queryKey: [QueryKey.FRIENDS, user?.userId],
            queryFn:() => fetchFriends(user?.userId),
            enabled: !!user,
            staleTime: queryOptions.staleTime,
            retry: queryOptions.retry,
        }
    );

    const { isSuccess, isLoading, isError, error } = queryResult;

    useEffect(()=> {
        isSuccess && setPosts(queryResult.data!.flatMap((friend) => friend.ownerOf))
    }, [isSuccess])

    useEffect(()=> {
        setLoading(TabType.FRIENDS, isLoading ? true : false);
    }, [isLoading])

    useEffect(()=>{
        isError && console.error(`[${user?.userId} ${user?.username}] Error fetching friends data : ${error.message}`)
    }, [isError])

    return {
        friends: queryResult,
        friendsPosts: posts
    }
};

export { useFriends }