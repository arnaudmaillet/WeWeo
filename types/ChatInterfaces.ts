export interface IMessage {
    userId: string,
    content: string,
    date: string
}

export interface IChat {
    id: string,
    messages: IMessage[]
    participantsIds: string[]
}

export interface IChatScreen {
    chat: IChat,
    currentUserId: string
}