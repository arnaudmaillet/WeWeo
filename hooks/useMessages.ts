import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { QueryKey, queryOptions } from "~/constants/constants"; // Ajustez selon votre projet
import { IMessage } from "~/contexts/markers/types";
import { createMessage } from "~/services/messages/create";
import { messageSubscription } from "~/services/messages/subscription";
import { useUserStore } from "~/store/useUserStore";

interface AddMessageParams {
    markerId: string;
    message: {
        senderId: string;
        content: string;
        createdAt: Date;
    };
}

const useMessages = (markerId: string | undefined) => {
    const { user } = useUserStore();

    const queryResult = useQuery<IMessage[] | undefined, Error>({
        queryKey: [QueryKey.MESSAGES, markerId],
        queryFn: () =>
            new Promise((resolve, reject) => {
                if (!markerId) return reject("Marker ID is required");
                const unsubscribe = messageSubscription(markerId, resolve);
                return () => unsubscribe();
            }),
        enabled: !!markerId,
        staleTime: queryOptions.staleTime,
        retry: queryOptions.retry,
    });

    const { isError, error } = queryResult;

    useEffect(() => {
        if (isError) {
            console.error(
                `[User: ${user?.userId}] Error fetching messages for marker ${markerId}: ${error}`
            );
        }
    }, [isError]);

    const mutation = useMutation({
        mutationFn: ({ markerId, message }: AddMessageParams) => createMessage(markerId, message),
        onError: (error: any) => console.error("Error adding message:", error),
        onSettled: () => {
            queryResult.refetch();
        },
    });

    return {
        messages: queryResult,
        createMessage: (content: string) => {
            if (!markerId || !user?.userId) {
                console.error("Cannot send message without markerId or user");
                return;
            }
            mutation.mutate({
                markerId,
                message: {
                    senderId: user.userId,
                    content,
                    createdAt: new Date(),
                },
            });
        },
    };
};

export { useMessages };
