import { gql } from '@apollo/client';


export const ON_NEW_MESSAGE = gql`
  subscription OnNewMessage($markerId: String!) {
    onNewMessage(markerId: $markerId) {
      messageId
      content
      senderId
      timestamp
      type
    }
  }
`;