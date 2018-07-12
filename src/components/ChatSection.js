import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import green from '@material-ui/core/colors/green'
import grey from '@material-ui/core/colors/grey'
import { withStyles } from '@material-ui/core/styles'

import ChatBubble from './ChatBubble'

const styles = {
  root: {
    backgroundColor: grey[100],
    height: 400,
    overflowY: 'scroll',
    padding: '1em'
  }
}

const GET_MSGS = gql`
  query getMessages {
    messages {
      edges {
        node {
          id
          datetime
          message
          userId
        }
      }
    }
  }
`

const MSG_SUBSCRIPTION = gql`
  subscription newMessage {
    message {
      id
      datetime
      message
      userId
    }
  }
`

class ChatMessages extends React.Component {
  componentDidMount() {
    this.props.subscribeToMore({
      document: MSG_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newMsg = subscriptionData.data
        if (newMsg.message.userId === this.props.localUser) return prev
        const newMsgNode = {
          node: { ...newMsg.message, __typename: 'Message' },
          __typename: 'MessagesEdge'
        }
        return {
          messages: {
            edges: [...prev.messages.edges, newMsgNode],
            __typename: 'MessagesConnection'
          }
        }
      }
    })
  }

  render() {
    const { classes, messages, localUser } = this.props
    return (
      <div className={classes.root}>
        {messages.edges.map(
          msg =>
            msg.node.userId === localUser ? (
              <ChatBubble
                key={msg.node.id}
                background={green[100]}
                marginLeft={100}
              >
                {msg.node.message}
              </ChatBubble>
            ) : (
              <ChatBubble key={msg.node.id} marginLeft={-100}>
                {msg.node.message}
              </ChatBubble>
            )
        )}
      </div>
    )
  }
}

export default withStyles(styles)(({ classes }) => {
  return (
    <Query
      query={gql`
        query chatSectionClientState {
          localUser @client
        }
      `}
    >
      {({ data: { localUser } }) => (
        <Query query={GET_MSGS}>
          {({ subscribeToMore, loading, error, data: { messages } }) => {
            if (loading) return '...'
            if (error) return `Error! ${error.message}`
            return (
              <ChatMessages
                classes={classes}
                localUser={localUser}
                messages={messages}
                subscribeToMore={subscribeToMore}
              />
            )
          }}
        </Query>
      )}
    </Query>
  )
})
