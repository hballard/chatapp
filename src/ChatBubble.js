import React from 'react'

import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import { withStyles } from '@material-ui/core/styles'
//import cyan from '@material-ui/core/colors/cyan'
import green from '@material-ui/core/colors/green'

import Image from './assets/images/Heath.png'

const styles = theme => ({
  bubble: {
    backgroundColor: green[100],
    padding: 5,
    borderRadius: 5,
  }
})

const ChatBubble = ({classes}) => {
  return (
    <Grid
      container
      justify='center'
      alignItems='center'
    >
      <Grid
        item xs={1}
        zeroMinWidth
      >
        <Avatar
          src={Image}
        />
      </Grid>
      <Grid
        item xs={4}
        className={classes.bubble}
      > Nullam adipiscing eros sit amet ante.
        Vestibulum ante. Sed quis ipsum non ligula
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(ChatBubble)
