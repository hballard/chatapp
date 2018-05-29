import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import green from '@material-ui/core/colors/green'
import grey from '@material-ui/core/colors/grey'

import ChatBubble from './ChatBubble'

const styles = {
  root: {
    backgroundColor: grey[100],
    maxHeight: 400,
    overflowY: 'scroll',
    padding: '1em'
  }
}

export default withStyles(styles)(({ classes }) => {
  return (
    <div className={classes.root}>
      <ChatBubble marginLeft={-100} />
      <ChatBubble background={green[100]} marginLeft={100} />
      <ChatBubble marginLeft={-100} />
      <ChatBubble background={green[100]} marginLeft={100} />
      <ChatBubble marginLeft={-100} />
      <ChatBubble background={green[100]} marginLeft={100} />
    </div>
  )
})
