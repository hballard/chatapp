import gql from 'graphql-tag'

const userFragment = gql`
  fragment UserProps on User {
    id
    name
    sessionId
    status
  }
`

export const GET_USERS = gql`
  query getUsers {
    users {
      edges {
        node {
          ...UserProps
        }
      }
    }
  }
  ${userFragment}
`

export const ADD_USER = gql`
  mutation addUser($name: String!, $sessionId: String!) {
    addUser(name: $name, sessionId: $sessionId) {
      ok
      user {
        ...UserProps
      }
    }
  }
  ${userFragment}
`

export const DELETE_USER = gql`
  mutation deleteUser($sessionId: String!) {
    deleteUser(sessionId: $sessionId) {
      ok
    }
  }
`

export const USER_SUBSCRIPTION = gql`
  subscription newUserSubscription {
    user {
      ...UserProps
    }
  }
  ${userFragment}
`

const msgFragment = gql`
  fragment MsgProps on Message {
    id
    datetime
    message
    userId
  }
`

export const GET_MSGS = gql`
  query getMessages {
    messages {
      edges {
        node {
          ...MsgProps
        }
      }
    }
  }
  ${msgFragment}
`

export const ADD_MSG = gql`
  mutation addMessage($message: String!, $userId: ID!) {
    addMessage(message: $message, userId: $userId) {
      ok
      message {
        ...MsgProps
      }
    }
  }
  ${msgFragment}
`

export const MSG_SUBSCRIPTION = gql`
  subscription newMessageSubscription {
    message {
      ...MsgProps
    }
  }
  ${msgFragment}
`

export const GET_CLIENT_STATE = gql`
  query getClientState {
    localUser @client
    sessionId @client
  }
`

export const GET_CLIENT_SESSION_ID = gql`
  query getClientSessionId {
    sessionId @client
  }
`

export const GET_CLIENT_LOCALUSER = gql`
  query getClientLocalUser {
    localUser @client
  }
`
