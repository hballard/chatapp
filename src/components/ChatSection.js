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

export default withStyles(styles)(({ classes }) => {
  return (
    <Query
      query={gql`
        {
          localUser @client
        }
      `}
    >
      {({ data: { localUser } }) => (
        <Query query={GET_MSGS} pollInterval={10000}>
          {({ loading, error, data: { messages } }) => {
            if (loading) return '...'
            if (error) return `Error! ${error.message}`
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
          }}
        </Query>
      )}
    </Query>
  )
})
