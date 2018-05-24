import React from 'react'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Image from './assets/images/Heath.png'


const AvatarName = props => {
  return (
    <Grid
      container
      justify='center'
      alignItems='center'
    >
      <Grid
        item xs={1}
        zeroMinWidth >
        <Avatar
          src={Image}
        />
      </Grid>
      <Grid item xs={2} zeroMinWidth >
        Heath Ballard
      </Grid>
    </Grid>
  )
}

export default AvatarName
