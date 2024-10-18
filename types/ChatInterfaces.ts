export interface MessageProps {
    userId: number,
    content: string,
    date: string
}

export interface ChatProps {
    id: number,
    messages: MessageProps[]
    participantsIds: number[]
}

export interface ChatScreenProps {
    chat: ChatProps,
    currentUserId: number
}