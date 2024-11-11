import { gql } from '@apollo/client';


export const ON_NEW_MESSAGE = gql`
  subscription OnNewMessage($markerId: String) {
    onNewMessage(markerId: $markerId) {
      messageId
      markerId
      content
      senderId
      timestamp
      type
      senderInfo {
        birthdate
        email
        locale
        userId
        username
        }
    }
  }
`;