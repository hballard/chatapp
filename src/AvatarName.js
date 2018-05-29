import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'

import Image from './assets/images/Heath.png'

const styles = {
  root: {
    padding: '1em'
  },
  avatar: {
    marginRight: 10
  }
}

export default withStyles(styles)(
  ({ classes, width, height, variant, backgroundColor, color, children }) => {
    return (
      <Grid
        container
        alignItems="center"
        style={{ backgroundColor }}
        className={classes.root}
      >
        <Grid item>
          <Avatar
            src={Image}
            className={classes.avatar}
            style={{ width, height }}
          />
        </Grid>
        <Grid item>
          <Typography variant={variant} style={{ color }}>
            {children}
          </Typography>
        </Grid>
      </Grid>
    )
  }
)
