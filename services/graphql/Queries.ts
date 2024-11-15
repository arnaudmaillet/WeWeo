import { gql } from '@apollo/client';

export const GET_MESSAGES = gql`
  query GetMessages($markerId: String!) {
    getMessages(markerId: $markerId) {
      messageId
      content
      senderId
      timestamp
      type
      senderInfo {
        userId
        username
        email
        birthdate
        locale
      }
    }
  }
`;

export const GET_MARKERS = gql`
  query GetMarkers {
    getMarkers {
      markerId
      coordinates {
        long
        lat
      }
      createdAt
      senderId
      label
      minZoom
    }
  }
`;