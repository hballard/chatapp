import React from 'react'
import green from '@material-ui/core/colors/green'

import ChatBubble from './ChatBubble'
import { MSG_SUBSCRIPTION } from '../graphql'

class ChatMessages extends React.Component {
  componentDidMount() {
    this.props.subscribeToMore({
      document: MSG_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newMsg = subscriptionData.data
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

export default ChatMessages
