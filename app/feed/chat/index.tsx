import { FC } from "react"
import Chat from "~/components/post/chat/Chat"
import { useMessages } from "~/hooks/useMessages"
import { useUserStore } from "~/store/useUserStore"


const index: FC = () => {
    const { user, activePost } = useUserStore()
    const { messages } = useMessages(activePost?.markerId)
    return <Chat messages={messages.data || []} currentUser={user} />
}

export default index