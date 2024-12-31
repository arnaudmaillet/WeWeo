import { useQuery } from "@tanstack/react-query";
import { IMarker } from "~/contexts/markers/types";
import { IUser } from "~/types/userTypes";

import { fetchFriends } from "~/services/friends/fetch";
import { useEffect } from "react";
import { TabType } from "~/types/navbarTypes";
import { useNavbarStore } from "~/store/navbarStore";
import { QueryKey, queryOptions } from "~/constants/constants";

const useFriends = (user?: IUser) => {
    const { setLoading } = useNavbarStore();
    
    const queryResult = useQuery<IMarker[] | undefined, Error>({
            queryKey: [QueryKey.FRIENDS, user?.userId],
            queryFn:() => fetchFriends(user),
            enabled: !!user,
            staleTime: queryOptions.staleTime,
            retry: queryOptions.retry,
        }
    );

    const { isLoading, isError } = queryResult;

    useEffect(()=> {
        setLoading(TabType.FRIENDS, isLoading ? true : false);
    }, [isLoading])

    useEffect(()=>{
        isError && console.error(`Error fetching friends data, user ${user?.userId} ${user?.username}`)
    }, [isError])

    return {
        friendsQuery: queryResult
    }
};

export { useFriends }