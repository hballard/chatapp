import React from 'react'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import cyan from '@material-ui/core/colors/cyan'
import { withStyles } from '@material-ui/core/styles'

import Image from '../assets/images/Heath.png'

const styles = theme => ({
  root: {
    margin: 20
  },
  bubble: {
    backgroundColor: cyan[100],
    padding: 5,
    borderRadius: 5,
    marginLeft: 20
  }
})

export default withStyles(styles)(
  ({ children, classes, background, marginLeft }) => {
    return (
      <Grid
        container
        justify="center"
        style={{ marginLeft }}
        className={classes.root}
      >
        <Grid item xs={1} zeroMinWidth>
          <Avatar src={Image} className={classes.avatar} />
        </Grid>
        <Grid item xs={4} className={classes.bubble} style={{ background }}>
          {children}
        </Grid>
      </Grid>
    )
  }
)
