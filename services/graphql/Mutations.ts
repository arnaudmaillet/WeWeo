import { gql } from '@apollo/client';

export const SEND_MESSAGE = gql`
  mutation SendMessage($markerId: String!, $content: String!, $senderId: String!, $type: String!) {
    sendMessage(markerId: $markerId, content: $content, senderId: $senderId, type: $type) {
      messageId
      markerId
      content
      senderId
      timestamp
      type
      senderInfo {
        birthdate
        userId
        username
        email
        locale
        }
    }
  }
`;
