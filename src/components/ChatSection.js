import React from 'react'
import { Query } from 'react-apollo'
import grey from '@material-ui/core/colors/grey'
import { withStyles } from '@material-ui/core/styles'

import ChatMessages from './ChatMessages'
import { GET_MSGS, GET_CLIENT_LOCALUSER } from '../graphql'

const styles = {
  root: {
    backgroundColor: grey[100],
    height: 400,
    overflowY: 'scroll',
    padding: '1em'
  }
}

export default withStyles(styles)(({ classes }) => {
  return (
    <Query query={GET_CLIENT_LOCALUSER}>
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
